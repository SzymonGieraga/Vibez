import React, { useState, useEffect, Suspense, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from 'firebase/auth';
import i18n from 'i18next';
import { useTranslation, I18nextProvider } from 'react-i18next';

// --- Definicja Tłumaczeń ---
const plTranslations = {
    welcome: "Witaj w Twojej Apce!",
    discoverMusic: "Zaloguj się lub zarejestruj, aby odkrywać muzykę.",
    login: "Zaloguj się",
    register: "Zarejestruj się",
    email: "Email",
    password: "Hasło",
    confirmPassword: "Potwierdź hasło",
    loginWithGoogle: "Zaloguj się z Google",
    logout: "Wyloguj",
    loggedIn: "Zalogowano!",
    welcomeUser: "Witaj",
    loading: "Ładowanie...",
    or: "LUB",
    loginFailed: "Nie udało się zalogować. Sprawdź e-mail i hasło.",
    googleLoginFailed: "Nie udało się zalogować przez Google.",
    registrationFailed: "Nie udało się zarejestrować. Spróbuj ponownie.",
    emailInUse: "Ten adres email jest już zajęty.",
    passwordsNoMatch: "Hasła nie są takie same.",
    back: "Powrót",
    nextVideo: "Następny",
    prevVideo: "Poprzedni",
};

const enTranslations = {
    welcome: "Welcome to Your App!",
    discoverMusic: "Login or register to discover music.",
    login: "Log In",
    register: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    loginWithGoogle: "Log in with Google",
    logout: "Log Out",
    loggedIn: "Logged In!",
    welcomeUser: "Welcome",
    loading: "Loading...",
    or: "OR",
    loginFailed: "Failed to log in. Check your email and password.",
    googleLoginFailed: "Failed to log in with Google.",
    registrationFailed: "Failed to register. Please try again.",
    emailInUse: "This email address is already in use.",
    passwordsNoMatch: "Passwords do not match.",
    back: "Back",
    nextVideo: "Next",
    prevVideo: "Previous",
};

// --- Konfiguracja i18next ---
i18n.init({
    resources: {
        pl: { translation: plTranslations },
        en: { translation: enTranslations },
    },
    lng: 'pl',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});


// --- Konfiguracja Firebase ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// --- Inicjalizacja Aplikacji ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Komponenty Ikon (SVG) ---
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.986,35.666,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const MuteIcon = () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l4-4m0 4l-4-4" /></svg>
);

const UnmuteIcon = () => (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-1.464a5 5 0 010-7.072M21 12H3" /></svg>
);

const PlayIcon = () => (
    <svg className="w-20 h-20 text-white opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
);

// --- Główny Komponent Aplikacji (Wrapper) ---
export default function AppWrapper() {
    return (
        <I18nextProvider i18n={i18n}>
            <Suspense fallback="Loading...">
                <App />
            </Suspense>
        </I18nextProvider>
    )
}

// --- Komponent Aplikacji ---
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('start');
    const { t } = useTranslation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <div className="text-white flex items-center justify-center h-screen">{t('loading')}</div>;
        }
        if (user) {
            return <VideoFeedPage user={user} />;
        }
        switch (view) {
            case 'login':
                return <AuthPage currentView="login" setView={setView} />;
            case 'register':
                return <AuthPage currentView="register" setView={setView} />;
            case 'start':
            default:
                return <StartPage setView={setView} />;
        }
    };

    return (
        <div className="bg-black text-white font-mono">
            <LanguageSwitcher />
            {renderContent()}
        </div>
    );
}

// --- Komponenty Stron ---
function LanguageSwitcher() {
    const { i18n } = useTranslation();
    return (
        <div className="absolute top-4 right-4 text-xs z-20">
            <button
                onClick={() => i18n.changeLanguage('pl')}
                disabled={i18n.language === 'pl'}
                className={`px-2 py-1 ${i18n.language === 'pl' ? 'text-white font-bold' : 'text-gray-500'}`}
            >
                PL
            </button>
            <span className="text-gray-500">|</span>
            <button
                onClick={() => i18n.changeLanguage('en')}
                disabled={i18n.language === 'en'}
                className={`px-2 py-1 ${i18n.language === 'en' ? 'text-white font-bold' : 'text-gray-500'}`}
            >
                EN
            </button>
        </div>
    );
}

function StartPage({ setView }) {
    const { t } = useTranslation();
    return (
        <div className="w-screen h-screen flex flex-col md:flex-row items-center justify-center">
            <div
                onClick={() => setView('login')}
                className="group w-full h-1/2 md:h-full md:w-1/2 flex items-center justify-center cursor-pointer border-b-2 md:border-b-0 md:border-r-2 border-gray-700 transition-all duration-300 hover:bg-gray-900"
            >
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-400 group-hover:text-white transition-colors duration-300">{t('login')}</h1>
            </div>
            <div
                onClick={() => setView('register')}
                className="group w-full h-1/2 md:h-full md:w-1/2 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-gray-900"
            >
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-400 group-hover:text-white transition-colors duration-300">{t('register')}</h1>
            </div>
        </div>
    );
}

function AuthPage({ currentView, setView }) {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">{t('welcome')}</h1>
                    <p className="text-gray-500 text-sm mt-2">{t('discoverMusic')}</p>
                </div>
                <div className="bg-black border border-gray-800 p-8 rounded-lg shadow-2xl">
                    {currentView === 'login' ? <LoginPage /> : <RegisterPage />}
                </div>
                <button onClick={() => setView('start')} className="mt-6 text-sm text-gray-500 hover:text-white flex items-center justify-center w-full">
                    <ArrowLeftIcon /> {t('back')}
                </button>
            </div>
        </div>
    );
}

function LoginPage() {
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
            console.error("Błąd logowania:", err);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError(t('googleLoginFailed'));
            console.error("Błąd logowania Google:", err);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            {error && <p className="bg-gray-800 border border-red-700 text-red-400 p-3 rounded-md text-xs">{error}</p>}
            <div>
                <label className="block text-xs font-medium text-gray-400">{t('email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400">{t('password')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500" />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white">
                {t('login')}
            </button>
            <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                <div className="relative flex justify-center text-xs"><span className="px-2 bg-black text-gray-500">{t('or')}</span></div>
            </div>
            <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white">
                <GoogleIcon />{t('loginWithGoogle')}
            </button>
        </form>
    );
}

function RegisterPage() {
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await syncUserWithBackend(userCredential.user);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError(t('emailInUse'));
            } else {
                setError(t('registrationFailed'));
            }
            console.error("Błąd rejestracji:", err);
        }
    };

    const syncUserWithBackend = async (firebaseUser) => {
        try {
            const token = await firebaseUser.getIdToken();
            const apiUrl = 'http://localhost:8080/api';

            const response = await fetch(`${apiUrl}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: firebaseUser.email, uid: firebaseUser.uid })
            });

            if (!response.ok) throw new Error('Synchronizacja z backendem nie powiodła się.');

            const data = await response.json();
            console.log('Użytkownik zsynchronizowany z backendem:', data);

        } catch (error) {
            console.error("Błąd synchronizacji użytkownika z backendem:", error);
        }
    };

    return (
        <form onSubmit={handleRegister} className="space-y-6">
            {error && <p className="bg-gray-800 border border-red-700 text-red-400 p-3 rounded-md text-xs">{error}</p>}
            <div>
                <label className="block text-xs font-medium text-gray-400">{t('email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400">{t('password')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400">{t('confirmPassword')}</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500" />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white">
                {t('register')}
            </button>
        </form>
    );
}

// Dane naszych filmów dodane na stałe
const videos = [
    {
        id: 1,
        url: 'https://pub-2bf3c78cb53844c490389c1c3331b74d.r2.dev/twittervid.com_shitpost_2077_11a5f2.mp4',
        user: 'VibezUser',
        description: 'Odkryj ten niesamowity utwór!'
    },
    {
        id: 2,
        url: 'https://pub-2bf3c78cb53844c490389c1c3331b74d.r2.dev/xejDmvKoHLT00tc3.mp4',
        user: 'MusicFan',
        description: 'Nowy hit tego lata, posłuchaj teraz.'
    }
];

function VideoFeedPage({ user }) {
    const { t } = useTranslation();
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);

    const goToNextVideo = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    const goToPrevVideo = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    useEffect(() => {
        if(videoRef.current) {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                setIsPlaying(false);
                console.warn("Autoodtwarzanie zablokowane:", error);
            });
        }
    }, [currentVideoIndex]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error("Błąd wylogowania:", err);
        }
    };

    const currentVideo = videos[currentVideoIndex];

    return (
        <div className="relative w-screen h-screen bg-black flex items-center justify-center">
            {/* Odtwarzacz Wideo */}
            <video
                ref={videoRef}
                key={currentVideo.url}
                className="w-full h-full object-contain"
                src={currentVideo.url}
                autoPlay
                muted={isMuted}
                playsInline
                onEnded={goToNextVideo}
                onClick={togglePlay}
            />

            {/* Ikona Play/Pause */}
            {!isPlaying && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <PlayIcon />
                </div>
            )}

            {/* Interfejs Użytkownika (Overlay) */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between p-4 text-white pointer-events-none">
                {/* Górny Pasek */}
                <div className="flex justify-between items-center w-full">
                    <h1 className="text-xl font-bold">Vibez</h1>
                    <button onClick={handleLogout} className="py-1 px-3 border border-gray-700 rounded-md text-xs bg-black bg-opacity-50 hover:bg-gray-900 pointer-events-auto">
                        {t('logout')}
                    </button>
                </div>

                {/* Dolne Informacje i przycisk dźwięku */}
                <div className="flex justify-between items-end w-full">
                    <div className="self-start">
                        <p className="font-bold">@{currentVideo.user}</p>
                        <p className="text-sm">{currentVideo.description}</p>
                    </div>
                    <button onClick={toggleMute} className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-75 pointer-events-auto">
                        {isMuted ? <MuteIcon /> : <UnmuteIcon />}
                    </button>
                </div>
            </div>

            {/* Przyciski Nawigacyjne */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-4">
                <button onClick={goToPrevVideo} className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-75 transform rotate-180">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-4">
                <button onClick={goToNextVideo} className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-75">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
}



