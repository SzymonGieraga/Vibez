import React, { useState, useEffect, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setupNotifications } from './firebaseMessaging';

import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import i18n from './i18n';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import ChatModal from './components/ChatModal';
import { auth } from './firebaseConfig';

let stompClient = null;

export default function AppWrapper() {
    return (
        <I18nextProvider i18n={i18n}>
            <Suspense fallback={<div className="bg-black text-white flex items-center justify-center h-screen">Loading...</div>}>
                <Router>
                    <App />
                </Router>
            </Suspense>
        </I18nextProvider>
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

    const totalUnreadChats = Object.values(unreadMessages).reduce((a, b) => a + b, 0);

    const fetchNotifications = async (token) => {
        try {
            const response = await fetch('http://localhost:8080/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            } else {
                console.error("Nie udało się pobrać listy powiadomień.");
            }
        } catch (error) {
            console.error("Błąd fetchNotifications:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:8080/api/notifications/read-all', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setLastNotification(prev => prev ? { ...prev, read: true } : null);
            } else {
                console.error("Nie udało się oznaczyć powiadomień jako przeczytane.");
            }
        } catch (error) {
            console.error("Błąd handleMarkAllAsRead:", error);
        }
    };

    const fetchChatRooms = async (token) => {
        try {
            const response = await fetch('http://localhost:8080/api/chats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setChatRooms(data);
            } else {
                console.error("Nie udało się pobrać listy czatów.");
            }
        } catch (error) {
            console.error("Błąd fetchChatRooms:", error);
        }
    };

    const fetchChatHistory = async (chatId, page = 0, size = 50) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:8080/api/chats/${chatId}/messages?page=${page}&size=${size}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();

                setChatMessages(prev => {
                    const existingIds = new Set((prev[chatId] || []).map(m => m.id));
                    const newMessages = data.content.filter(m => !existingIds.has(m.id));
                    return {
                        ...prev,
                        [chatId]: [...newMessages.reverse(), ...(prev[chatId] || [])]
                    };
                });
                return data;
            }
        } catch (error) {
            console.error("Błąd fetchChatHistory:", error);
        }
    };

    const createOrGetPrivateChat = async (participantUsername) => {
        if (!user) return null;
        const token = await user.getIdToken();
        try {
            const response = await fetch('http://localhost:8080/api/chats/private', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ participantUsername })
            });
            if (response.ok) {
                const newRoom = await response.json();
                setChatRooms(prev => {
                    if (prev.find(r => r.id === newRoom.id)) return prev;
                    return [newRoom, ...prev];
                });
                return newRoom;
            }
        } catch (error) { console.error("Błąd createOrGetPrivateChat:", error); }
        return null;
    };

    const connectWebSocket = (token) => {
        try {
            stompClient = Stomp.over(function () {
                return new SockJS('http://localhost:8080/ws');
            });
            stompClient.debug = () => {};
            const headers = { 'Authorization': `Bearer ${token}` };

            stompClient.connect(headers, (frame) => {

                stompClient.subscribe('/user/queue/notifications', (message) => {
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

                stompClient.subscribe('/user/queue/chat-messages', (message) => {
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

                stompClient.subscribe('/user/queue/chat-updates', (payload) => {
                    const update = JSON.parse(payload.body);
                    const roomId = update.chatRoomId;

                    setChatMessages(prev => {
                        const currentMessages = prev[roomId] || [];

                        if (update.type === 'EDIT' || update.type === 'DELETE') {
                            return {
                                ...prev,
                                [roomId]: currentMessages.map(msg =>
                                    msg.id === update.message.id ? update.message : msg
                                )
                            };
                        }
                        return prev;
                    });
                });

            }, (error) => {
                console.error('WebSocket: Błąd połączenia: ' + error);
                setTimeout(() => connectWebSocket(token), 5000);
            });
        } catch (error) {
            console.error("WebSocket: Błąd inicjalizacji.", error);
        }
    };

    const disconnectWebSocket = () => {
        if (stompClient) {
            stompClient.disconnect(() => console.log("WebSocket: Rozłączono."));
            stompClient = null;
        }
    };

    const sendChatMessage = (chatId, content, reelId = null) => {
        if (stompClient && stompClient.connected) {
            const payload = { content, reelId };
            stompClient.send(`/app/chat/${chatId}/send`, {}, JSON.stringify(payload));
        } else {
            console.error("STOMP nie jest połączony.");
        }
    };

    const editChatMessage = (messageId, newContent) => {
        if (stompClient && stompClient.connected) {
            const payload = { messageId, newContent };
            stompClient.send(`/app/chat/edit`, {}, JSON.stringify(payload));
        }
    };

    const deleteChatMessage = (messageId) => {
        if (stompClient && stompClient.connected) {
            const payload = { messageId };
            stompClient.send(`/app/chat/delete`, {}, JSON.stringify(payload));
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    const response = await fetch('http://localhost:8080/api/users/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ email: currentUser.email, firebaseUid: currentUser.uid })
                    });
                    if (!response.ok) throw new Error("Sync failed");
                    const appUserData = await response.json();

                    setAppUser(appUserData);
                    setUser(currentUser);

                    await setupNotifications();

                    await fetchNotifications(token);
                    await fetchChatRooms(token);

                    connectWebSocket(token);

                } catch (error) {
                    console.error("Błąd logowania lub synchronizacji:", error);
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

    if (loading) {
        return <div className="bg-black text-white flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <>
            <Routes>
                <Route path="/auth" element={!user ? <AuthPage auth={auth} /> : <Navigate to="/" />} />

                <Route
                    path="/profile/:username"
                    element={
                        user && appUser ?
                            <ProfilePage
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
                            /> : <Navigate to="/auth" />}
                />

                <Route
                    path="/"
                    element={
                        user && appUser ?
                            <MainPage
                                auth={auth}
                                user={user}
                                appUser={appUser}
                                unreadCount={unreadCount}
                                lastNotification={lastNotification}
                                setLastNotification={setLastNotification}
                                notifications={notifications}
                                setNotifications={setNotifications}
                                handleMarkAllAsRead={handleMarkAllAsRead}
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
            />
        </>
    );
}