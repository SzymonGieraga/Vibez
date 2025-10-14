import React, { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const GoogleIcon = () => ( <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.986,35.666,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg> );
const ArrowLeftIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> );

const googleProvider = new GoogleAuthProvider();

export default function AuthPage({ auth }) {
    const [view, setView] = useState('start');

    switch (view) {
        case 'login':
            return <AuthForm currentView="login" setView={setView} auth={auth} />;
        case 'register':
            return <AuthForm currentView="register" setView={setView} auth={auth} />;
        case 'start':
        default:
            return <StartPage setView={setView} />;
    }
}

const StartPage = ({ setView }) => {
    const { t } = useTranslation();
    return (
        <div className="w-screen h-screen flex flex-col md:flex-row items-center justify-center">
            <div onClick={() => setView('login')} className="group w-full h-1/2 md:h-full md:w-1/2 flex items-center justify-center cursor-pointer border-b-2 md:border-b-0 md:border-r-2 border-gray-700 transition-all duration-300 hover:bg-gray-900">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-400 group-hover:text-white transition-colors duration-300">{t('login')}</h1>
            </div>
            <div onClick={() => setView('register')} className="group w-full h-1/2 md:h-full md:w-1/2 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-gray-900">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-400 group-hover:text-white transition-colors duration-300">{t('register')}</h1>
            </div>
        </div>
    );
};

const AuthForm = ({ currentView, setView, auth }) => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">{t('welcome')}</h1>
                    <p className="text-gray-500 text-sm mt-2">{t('discoverMusic')}</p>
                </div>
                <div className="bg-black border border-gray-800 p-8 rounded-lg shadow-2xl">
                    {currentView === 'login' ? <LoginPage auth={auth} /> : <RegisterPage auth={auth} />}
                </div>
                <button onClick={() => setView('start')} className="mt-6 text-sm text-gray-500 hover:text-white flex items-center justify-center w-full">
                    <ArrowLeftIcon /> {t('back')}
                </button>
            </div>
        </div>
    );
};

function LoginPage({ auth }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError(t('loginFailed'));
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError(t('googleLoginFailed'));
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            {error && <p className="bg-gray-800 border border-red-700 text-red-400 p-3 rounded-md text-xs">{error}</p>}
            <div>
                <label className="block text-xs font-medium text-gray-400">{t('email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400">{t('password')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500" />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200">
                {t('login')}
            </button>
            <div className="relative my-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div><div className="relative flex justify-center text-xs"><span className="px-2 bg-black text-gray-500">{t('or')}</span></div></div>
            <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-black hover:bg-gray-900">
                <GoogleIcon />{t('loginWithGoogle')}
            </button>
        </form>
    );
}

function RegisterPage({ auth }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError(t('passwordsNoMatch'));
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError(t('emailInUse'));
            } else {
                setError(t('registrationFailed'));
            }
        }
    };

    return (
        <form onSubmit={handleRegister} className="space-y-6">
            {error && <p className="bg-gray-800 border border-red-700 text-red-400 p-3 rounded-md text-xs">{error}</p>}
            <div>
                <label className="block text-xs font-medium text-gray-400">{t('email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400">{t('password')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400">{t('confirmPassword')}</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500" />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200">
                {t('register')}
            </button>
        </form>
    );
}

