import React, { useState, useEffect, Suspense } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import i18n from './i18n';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
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
            <Route path="/profile/:username" element={user ? <ProfilePage auth={auth} currentUser={user} /> : <Navigate to="/auth" />} />
            <Route path="/" element={user ? <MainPage auth={auth} user={user} /> : <Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

