import React, { useState, useEffect, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setupNotifications } from './firebaseMessaging';
import { apiClient, initWebSocket } from './api/apiClient.js';

import { Stomp } from '@stomp/stompjs';

import i18n from './i18n';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ChatModal from './components/ChatModal';
import ToastNotification from './components/ToastNotification';
import { auth } from './firebaseConfig';

let stompClient = null;

export default function AppWrapper() {
    useEffect(() => {
        const savedLanguage = localStorage.getItem('app_language');
        if (savedLanguage) {
            i18n.changeLanguage(savedLanguage);
        }
    }, []);

    return (
        <Suspense fallback={<div className="bg-black text-white flex items-center justify-center h-screen">Loading...</div>}>
            <Router>
                <App />
            </Router>
        </Suspense>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [appUser, setAppUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [lastNotification, setLastNotification] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const unreadCount = notifications.filter(n => !n.read).length;

    const [chatRooms, setChatRooms] = useState([]);
    const [chatMessages, setChatMessages] = useState({});
    const [unreadMessages, setUnreadMessages] = useState({});
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);

    const [toast, setToast] = useState(null);
    const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);

    const [activeChatRoomId, setActiveChatRoomId] = useState(null);

    const totalUnreadChats = Object.values(unreadMessages).reduce((a, b) => a + b, 0);

    const openChatWithRoom = (roomId) => {
        setActiveChatRoomId(roomId);
        setIsChatModalOpen(true);
    };

    const fetchNotifications = async (token) => {
        try {
            const response = await apiClient('/notifications', {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error("Błąd fetchNotifications:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await apiClient('/notifications/read-all', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setLastNotification(prev => prev ? { ...prev, read: true } : null);
            }
        } catch (error) {
            console.error("Błąd handleMarkAllAsRead:", error);
        }
    };

    const handleMarkToastAsRead = async (notification) => {
        if (!notification || isMarkingAsRead || notification.read) return;
        setIsMarkingAsRead(true);

        try {
            const token = await user.getIdToken();
            const response = await apiClient(`/notifications/${notification.id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
                if (lastNotification?.id === notification.id) {
                    setLastNotification(prev => ({ ...prev, read: true }));
                }
            }
        } catch (error) {
            console.error("Błąd oznaczania powiadomienia:", error);
        } finally {
            setIsMarkingAsRead(false);
        }
    };

    const handleToastClose = () => {
        if (toast) handleMarkToastAsRead(toast);
        setToast(null);
    };

    const handleToastLinkClick = () => {
        if (toast) handleMarkToastAsRead(toast);
    };

    useEffect(() => {
        if (lastNotification && !lastNotification.read) {
            setToast(lastNotification);
            setIsMarkingAsRead(false);
            const timer = setTimeout(() => {
                setToast(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [lastNotification]);

    const fetchChatRooms = async (token) => {
        try {
            const response = await apiClient('/chats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setChatRooms(data);
        } catch (error) {
            console.error("Błąd fetchChatRooms:", error);
        }
    };

    const fetchChatHistory = async (chatId, page = 0, size = 50) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await apiClient(`/chats/${chatId}/messages?page=${page}&size=${size}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setChatMessages(prev => {
                const existingIds = new Set((prev[chatId] || []).map(m => m.id));
                const newMessages = data.content.filter(m => !existingIds.has(m.id));
                return { ...prev, [chatId]: [...newMessages.reverse(), ...(prev[chatId] || [])] };
            });
            return data;
        } catch (error) {
            console.error("Błąd fetchChatHistory:", error);
        }
    };

    const createOrGetPrivateChat = async (participantUsername) => {
        if (!user) return null;
        const token = await user.getIdToken();
        try {
            const response = await apiClient('/chats/private', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ participantUsername })
            });
            const newRoom = await response.json();
            setChatRooms(prev => {
                if (prev.find(r => r.id === newRoom.id)) return prev;
                return [newRoom, ...prev];
            });
            return newRoom;
        } catch (error) {
            console.error("Błąd createOrGetPrivateChat:", error);
        }
        return null;
    };

    const connectWebSocket = (token) => {
        if (stompClient && stompClient.active) return;

        stompClient = initWebSocket(token, (client) => {
            client.subscribe('/user/queue/notifications', (message) => {
                const notificationDto = JSON.parse(message.body);
                setNotifications(prevList => {
                    const exists = prevList.some(n => n.id === notificationDto.id);
                    if (exists) return prevList;
                    return [notificationDto, ...prevList];
                });
                if (!notificationDto.read) {
                    setLastNotification(notificationDto);
                }
            });

            client.subscribe('/user/queue/chat-messages', (message) => {
                const messageDto = JSON.parse(message.body);
                const roomId = messageDto.chatRoomId;

                setChatMessages(prev => ({
                    ...prev,
                    [roomId]: [...(prev[roomId] || []), messageDto]
                }));

                if (messageDto.sender.username !== appUser?.username) {
                    setUnreadMessages(prev => ({
                        ...prev,
                        [roomId]: (prev[roomId] || 0) + 1
                    }));
                }
            });

            client.subscribe('/user/queue/chat-updates', (payload) => {
                const update = JSON.parse(payload.body);
                const roomId = update.chatRoomId;
                setChatMessages(prev => {
                    const currentMessages = prev[roomId] || [];
                    if (update.type === 'EDIT' || update.type === 'DELETE') {
                        return {
                            ...prev,
                            [roomId]: currentMessages.map(msg => msg.id === update.message.id ? update.message : msg)
                        };
                    }
                    return prev;
                });
            });
        });
    };

    const disconnectWebSocket = () => {
        if (stompClient) {
            stompClient.deactivate();
            stompClient = null;
        }
    };

    const sendChatMessage = (chatId, content, reelId = null) => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: `/app/chat/${chatId}/send`,
                body: JSON.stringify({ content, reelId })
            });
        }
    };

    const editChatMessage = (messageId, newContent) => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: `/app/chat/edit`,
                body: JSON.stringify({ messageId, newContent })
            });
        }
    };

    const deleteChatMessage = (messageId) => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: `/app/chat/delete`,
                body: JSON.stringify({ messageId })
            });
        }
    };

    const createGroupChat = async (participantUsernames, name) => {
        if (!user) return null;

        try {
            const token = await user.getIdToken();

            const response = await apiClient('/chats/group', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name,
                    participantUsernames: participantUsernames
                })
            });

            const newRoom = await response.json();
            setChatRooms(prev => [newRoom, ...prev]);
            return newRoom;
        } catch (error) {
            console.error("Network error:", error);
        }
        return null;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    const response = await apiClient('/users/sync', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ email: currentUser.email, firebaseUid: currentUser.uid })
                    });

                    const appUserData = await response.json();

                    setAppUser(appUserData);
                    setUser(currentUser);
                    await setupNotifications();
                    await fetchNotifications(token);
                    await fetchChatRooms(token);
                    connectWebSocket(token);

                } catch (error) {
                    console.error("Auth sync error:", error);
                    setAppUser(null);
                    setUser(null);
                    disconnectWebSocket();
                }
            } else {
                setUser(null);
                setAppUser(null);
                setNotifications([]);
                setLastNotification(null);
                setChatRooms([]);
                setChatMessages({});
                setUnreadMessages({});
                setIsChatModalOpen(false);
                disconnectWebSocket();
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
            disconnectWebSocket();
        };
    }, []);

    if (loading) return <div className="bg-black text-white flex items-center justify-center h-screen">Loading...</div>;

    return (
        <>
            <ToastNotification
                notification={toast}
                onLinkClick={handleToastLinkClick}
                onClose={handleToastClose}
            />
            <Routes>
                <Route path="/auth" element={!user ? <AuthPage auth={auth} /> : <Navigate to="/" />} />
                <Route
                    path="/profile/:username"
                    element={user && appUser ? <ProfilePage
                        auth={auth}
                        currentUser={user}
                        appUser={appUser}
                        setAppUser={setAppUser}
                        unreadCount={unreadCount}
                        lastNotification={lastNotification}
                        setLastNotification={setLastNotification}
                        notifications={notifications}
                        setNotifications={setNotifications}
                        handleMarkAllAsRead={handleMarkAllAsRead}
                        totalUnreadChats={totalUnreadChats}
                        setIsChatModalOpen={setIsChatModalOpen}
                        openChat={openChatWithRoom}
                        createOrGetPrivateChat={createOrGetPrivateChat}
                    /> : <Navigate to="/auth" />}
                />
                <Route
                    path="/settings"
                    element={user && appUser ? <SettingsPage
                        auth={auth}
                        user={user}
                        appUser={appUser}
                        unreadCount={unreadCount}
                        notifications={notifications}
                        handleMarkAllAsRead={handleMarkAllAsRead}
                        handleMarkOneAsRead={handleMarkToastAsRead}
                        totalUnreadChats={totalUnreadChats}
                        setIsChatModalOpen={setIsChatModalOpen}
                    /> : <Navigate to="/auth" />}
                />
                <Route
                    path="/"
                    element={user && appUser ? <MainPage
                        auth={auth}
                        user={user}
                        appUser={appUser}
                        unreadCount={unreadCount}
                        notifications={notifications}
                        handleMarkAllAsRead={handleMarkAllAsRead}
                        handleMarkOneAsRead={handleMarkToastAsRead}
                        totalUnreadChats={totalUnreadChats}
                        setIsChatModalOpen={setIsChatModalOpen}
                    /> : <Navigate to="/auth" />}
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            <ChatModal
                isOpen={isChatModalOpen}
                onClose={() => setIsChatModalOpen(false)}
                appUser={appUser}
                chatRooms={chatRooms}
                chatMessages={chatMessages}
                unreadMessages={unreadMessages}
                setUnreadMessages={setUnreadMessages}
                fetchChatHistory={fetchChatHistory}
                sendChatMessage={sendChatMessage}
                editChatMessage={editChatMessage}
                deleteChatMessage={deleteChatMessage}
                createOrGetPrivateChat={createOrGetPrivateChat}
                activeRoomId={activeChatRoomId}
                setActiveRoomId={setActiveChatRoomId}
                createGroupChat={createGroupChat}
            />
        </>
    );
}