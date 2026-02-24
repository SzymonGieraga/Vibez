import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationPL from './locales/pl/translation.json';
import translationEN from './locales/en/translation.json';

const savedLanguage = localStorage.getItem('app_language') || 'pl';

const resources = {
    pl: {
        translation: translationPL
    },
    en: {
        translation: translationEN
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;