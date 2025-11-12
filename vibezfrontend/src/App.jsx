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

    const [unreadCount, setUnreadCount] = useState(0);
    const [lastNotification, setLastNotification] = useState(null);
    const [notifications, setNotifications] = useState([]); // <-- NOWA LISTA

    const fetchUnreadCount = async (token) => {
        try {
            const response = await fetch('http://localhost:8080/api/notifications/unread-count', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const count = await response.json();
                setUnreadCount(count);
            } else {
                console.error("Nie udało się pobrać licznika nieprzeczytanych powiadomień.");
            }
        } catch (error) {
            console.error("Błąd fetchUnreadCount:", error);
        }
    };

    const fetchNotifications = async (token) => {
        try {
            const response = await fetch('http://localhost:8080/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
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
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } else {
                console.error("Nie udało się oznaczyć powiadomień jako przeczytane.");
            }
        } catch (error) {
            console.error("Błąd handleMarkAllAsRead:", error);
        }
    };

    const connectWebSocket = (token) => {
        try {
            stompClient = Stomp.over(function () {
                return new SockJS('http://localhost:8080/ws');
            });
            stompClient.debug = () => {};
            const headers = { 'Authorization': `Bearer ${token}` };

            stompClient.connect(headers, (frame) => {
                console.log('WebSocket: Połączono (' + frame + ')');

                stompClient.subscribe('/user/queue/notifications', (message) => {
                    const notificationDto = JSON.parse(message.body);
                    console.log("Otrzymano powiadomienie:", notificationDto);

                    setLastNotification(notificationDto);
                    setUnreadCount(prevCount => prevCount + 1);
                    setNotifications(prevList => [notificationDto, ...prevList]);
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
                    connectWebSocket(token);
                    await fetchUnreadCount(token);
                    await fetchNotifications(token);

                } catch (error) {
                    console.error("Błąd logowania lub synchronizacji:", error);
                    setAppUser(null);
                    setUser(null);
                    disconnectWebSocket();
                }
            } else {
                setUser(null);
                setAppUser(null);
                setUnreadCount(0);
                setNotifications([]);
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
                            setUnreadCount={setUnreadCount}
                            lastNotification={lastNotification}
                            notifications={notifications}
                            handleMarkAllAsRead={handleMarkAllAsRead}
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
                            setUnreadCount={setUnreadCount}
                            lastNotification={lastNotification}
                            notifications={notifications}
                            handleMarkAllAsRead={handleMarkAllAsRead}
                        /> : <Navigate to="/auth" />}
            />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}