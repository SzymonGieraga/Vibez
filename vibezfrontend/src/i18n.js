import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const plTranslations = {
    welcome: "Witaj w Vibez!",
    discoverMusic: "Odkrywaj, twórz, dziel się muzyką.",
    login: "Zaloguj się",
    register: "Zarejestruj się",
    email: "Email",
    password: "Hasło",
    confirmPassword: "Potwierdź hasło",
    loginWithGoogle: "Zaloguj się z Google",
    logout: "Wyloguj",
    loading: "Ładowanie...",
    or: "LUB",
    loginFailed: "Błąd logowania. Sprawdź dane.",
    registrationFailed: "Błąd rejestracji.",
    passwordsNoMatch: "Hasła nie są takie same.",
    back: "Powrót",
};

const enTranslations = {
    welcome: "Welcome to Vibez!",
    discoverMusic: "Discover, create, share music.",
    login: "Log In",
    register: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    loginWithGoogle: "Log in with Google",
    logout: "Log Out",
    loading: "Loading...",
    or: "OR",
    loginFailed: "Login failed. Check credentials.",
    registrationFailed: "Registration failed.",
    passwordsNoMatch: "Passwords do not match.",
    back: "Back",
};

i18n
    .use(initReactI18next)
    .init({
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

export default i18n;
