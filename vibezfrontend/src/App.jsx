import React, { useState, useEffect, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setupNotifications } from './firebaseMessaging';

import i18n from './i18n';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import { auth } from './firebaseConfig';

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
                    await setupNotifications();

                } catch (error) {
                    console.error("User sync failed:", error);
                    setAppUser(null);
                }
                setUser(currentUser);
            } else {
                setUser(null);
                setAppUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="bg-black text-white flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/auth" element={!user ? <AuthPage auth={auth} /> : <Navigate to="/" />} />
            <Route path="/profile/:username" element={user && appUser ? <ProfilePage auth={auth} currentUser={user} appUser={appUser} setAppUser={setAppUser} /> : <Navigate to="/auth" />} />
            <Route path="/" element={user && appUser ? <MainPage auth={auth} user={user} appUser={appUser} /> : <Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}