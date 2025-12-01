import React, { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const GoogleIcon = () => ( <svg className="w-5 h-5 mr-3 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.986,35.666,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg> );
const ArrowLeftIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> );

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
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-black p-6 relative">
            <LanguageSwitcher className="absolute top-6 right-6 z-50" />

            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-thin tracking-[0.2em] text-white uppercase">{t('welcome')}</h1>
                <p className="text-zinc-500 text-sm mt-4 tracking-widest uppercase">{t('discoverMusic')}</p>
            </div>

            <div className="w-full md:w-[60%] h-[50vh] flex flex-col md:flex-row border border-t-0 border-b-0 border-l-0 border-r-0 border-zinc-800">
                <div onClick={() => setView('login')} className="group flex-1 flex items-center justify-center cursor-pointer transition-colors duration-500 hover:bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800">
                    <h2 className="text-xl md:text-3xl font-light tracking-widest text-zinc-600 group-hover:text-zinc-200 transition-colors duration-500 lowercase">{t('login')}</h2>
                </div>
                <div onClick={() => setView('register')} className="group flex-1 flex items-center justify-center cursor-pointer transition-colors duration-500 hover:bg-zinc-950">
                    <h2 className="text-xl md:text-3xl font-light tracking-widest text-zinc-600 group-hover:text-zinc-200 transition-colors duration-500 lowercase">{t('register')}</h2>
                </div>
            </div>
        </div>
    );
};

const AuthForm = ({ currentView, setView, auth }) => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-zinc-300 relative">
            <LanguageSwitcher className="absolute top-6 right-6 z-50" />

            <div className="w-full max-w-sm">
                <div className="text-center mb-12">
                    <h1 className="text-2xl font-light tracking-widest text-white uppercase">{t('welcome')}</h1>
                    <p className="text-zinc-600 text-xs mt-3 tracking-wide">{t('discoverMusic')}</p>
                </div>
                <div className="bg-transparent p-0">
                    {currentView === 'login' ? <LoginPage auth={auth} /> : <RegisterPage auth={auth} />}
                </div>
                <button onClick={() => setView('start')} className="mt-12 text-xs text-zinc-600 hover:text-white flex items-center justify-center w-full transition-colors duration-300">
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
        <form onSubmit={handleLogin} className="space-y-8">
            {error && <p className="text-red-500 text-xs text-center tracking-wide">{error}</p>}
            <div className="space-y-6">
                <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2 group-focus-within:text-zinc-400 transition-colors">{t('email')}</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors placeholder-transparent" />
                </div>
                <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2 group-focus-within:text-zinc-400 transition-colors">{t('password')}</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors placeholder-transparent" />
                </div>
            </div>

            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-zinc-800 text-xs font-medium uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-white hover:border-white transition-all duration-300">
                {t('login')}
            </button>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-900"></div>
                </div>
            </div>

            <button type="button" onClick={handleGoogleLogin} className="group w-full flex items-center justify-center py-3 px-4 border border-zinc-900 text-xs font-medium uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 bg-transparent transition-all duration-300">
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
    const [isAdult, setIsAdult] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!isAdult) {
            setError(t('mustBe18'));
            return;
        }

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
        <form onSubmit={handleRegister} className="space-y-8">
            {error && <p className="text-red-500 text-xs text-center tracking-wide">{error}</p>}
            <div className="space-y-6">
                <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2 group-focus-within:text-zinc-400 transition-colors">{t('email')}</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors" />
                </div>
                <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2 group-focus-within:text-zinc-400 transition-colors">{t('password')}</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" className="block w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors" />
                </div>
                <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2 group-focus-within:text-zinc-400 transition-colors">{t('confirmPassword')}</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="block w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors" />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            id="adult-check"
                            checked={isAdult}
                            onChange={(e) => setIsAdult(e.target.checked)}
                            className="peer h-4 w-4 appearance-none border border-zinc-700 bg-transparent checked:bg-white checked:border-white transition-colors cursor-pointer"
                        />
                        <svg className="absolute w-3 h-3 text-black pointer-events-none hidden peer-checked:block left-0.5 top-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <label htmlFor="adult-check" className={`text-[10px] uppercase tracking-widest cursor-pointer select-none transition-colors ${isAdult ? 'text-zinc-300' : 'text-zinc-600 hover:text-zinc-400'}`}>
                        {t('confirmAge')}
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={!isAdult}
                className={`w-full flex justify-center py-3 px-4 border text-xs font-medium uppercase tracking-widest transition-all duration-300 
                    ${isAdult
                    ? 'border-zinc-800 text-zinc-400 hover:text-black hover:bg-white hover:border-white cursor-pointer'
                    : 'border-zinc-900 text-zinc-700 cursor-not-allowed opacity-50'
                }`}
            >
                {t('register')}
            </button>
        </form>
    );
}