import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = {
    PL: 'pl',
    EN: 'en'
};

export default function LanguageSwitcher({ className = '' }) {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('app_language', lng);
    };

    const currentLang = i18n.resolvedLanguage || i18n.language;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <button
                onClick={() => changeLanguage(LANGUAGES.PL)}
                className={`text-[10px] uppercase tracking-widest transition-all duration-300 ${currentLang === LANGUAGES.PL ? 'text-white font-bold scale-105' : 'text-zinc-600 hover:text-zinc-300'}`}
            >
                Polski
            </button>
            <span className="text-zinc-800 text-[10px]">|</span>
            <button
                onClick={() => changeLanguage(LANGUAGES.EN)}
                className={`text-[10px] uppercase tracking-widest transition-all duration-300 ${currentLang === LANGUAGES.EN ? 'text-white font-bold scale-105' : 'text-zinc-600 hover:text-zinc-300'}`}
            >
                English
            </button>
        </div>
    );
}