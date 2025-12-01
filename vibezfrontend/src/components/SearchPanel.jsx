import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/apiClient';
import ReelPreview from './ReelPreview';

const SearchIcon = () => ( <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> );
const PlaceholderUserIcon = () => ( <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> );

export default function SearchPanel({ isOpen, onClose }) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState('top');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const tabs = [
        { id: 'top', label: t('tabTop') },
        { id: 'users', label: t('tabUsers') },
        { id: 'videos', label: t('tabVideos') },
        { id: 'tags', label: t('tabTags') },
    ];

    useEffect(() => {
        if (query.length < 3) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                let endpoint = '';
                switch (activeTab) {
                    case 'users':
                        endpoint = '/search/users';
                        break;
                    case 'videos':
                        endpoint = '/search/reels';
                        break;
                    case 'tags':
                        endpoint = '/search/tags';
                        break;
                    case 'top':
                    default:
                        endpoint = '/search/top';
                        break;
                }

                const response = await apiClient(`${endpoint}?query=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                } else {
                    console.error("Błąd wyszukiwania");
                    setResults([]);
                }
            } catch (error) {
                console.error("Błąd sieci:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query, activeTab]);

    const handleClear = () => {
        setQuery('');
        setResults([]);
    };

    const renderUserList = () => (
        <div className="space-y-2">
            {results.map((user) => (
                <Link
                    key={user.id}
                    to={`/profile/${user.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-700">
                        {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <PlaceholderUserIcon />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user.username}</p>
                        <p className="text-xs text-gray-400 truncate">{user.bio || user.email}</p>
                    </div>
                </Link>
            ))}
        </div>
    );

    const renderReelGrid = () => (
        <div className="grid grid-cols-3 gap-1 md:gap-2">
            {results.map((reel) => (
                <div key={reel.id} onClick={onClose}>
                    <ReelPreview reel={reel} />
                </div>
            ))}
        </div>
    );

    return (
        <div
            className={`fixed top-0 left-1/2 -translate-x-1/2 w-[95%] md:w-[60%] h-[40%] md:h-[50%] bg-black/80 backdrop-blur-xl z-50 transition-transform duration-300 ease-in-out border border-t-0 border-gray-700/50 rounded-b-2xl shadow-2xl flex flex-col ${
                isOpen ? 'translate-y-0' : '-translate-y-full'
            }`}
        >
            <div className="flex flex-col h-full pt-4 px-4 pb-2">
                <div className="flex items-center gap-3 mb-2 flex-shrink-0">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('searchPlaceholder')}
                            className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500 text-sm md:text-base"
                            autoFocus={isOpen}
                        />
                        {query && (
                            <button
                                onClick={handleClear}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                            >
                                <div className="bg-gray-700 rounded-full p-0.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-300 hover:text-white p-2 text-sm font-medium"
                    >
                        {t('cancel')}
                    </button>
                </div>

                <div className="flex border-b border-gray-700/50 mb-2 overflow-x-auto hide-scrollbar flex-shrink-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setResults([]); }}
                            className={`flex-1 pb-2 text-sm font-medium transition-colors whitespace-nowrap px-4 ${
                                activeTab === tab.id
                                    ? 'text-white border-b-2 border-white'
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                    {query.length < 3 ? (
                        <div className="mt-8 text-center text-gray-400">
                            <p className="text-sm">{t('searchMinChars')}</p>
                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 border border-gray-800">#viral</span>
                                <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 border border-gray-800">#music</span>
                                <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 border border-gray-800">#dance</span>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="mt-8 text-center text-gray-400">
                            <p className="text-sm">{t('noResults', { query })}</p>
                        </div>
                    ) : (
                        <div className="pt-2 pb-4">
                            {(activeTab === 'users' || activeTab === 'top')
                                ? renderUserList()
                                : renderReelGrid()
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}