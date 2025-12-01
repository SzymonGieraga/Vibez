import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/apiClient';

const CloseIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
const SearchIcon = () => (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const CheckIcon = () => (<svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>);

export default function ShareReelModal({ isOpen, onClose, reel, appUser, user }) {
    const { t } = useTranslation();
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const MAX_CHARS = 100;

    useEffect(() => {
        if (isOpen) {
            fetchChats();
        } else {
            setSelectedChatId(null);
            setMessageText("");
            setSearchQuery("");
        }
    }, [isOpen]);

    const fetchChats = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await apiClient('/chats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setChats(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!selectedChatId || !reel || !user) return;
        setIsSending(true);
        try {
            const token = await user.getIdToken();
            const response = await apiClient(`/chats/${selectedChatId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: messageText || t('shareReelDefaultMessage'),
                    reelId: reel.id
                })
            });

            if (response.ok) {
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const filteredChats = chats.filter(chat => {
        const name = chat.type === 'GROUP'
            ? chat.name
            : chat.participants.find(p => p.username !== appUser?.username)?.username || t('unknownUser');
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-zinc-900 w-full max-w-md rounded-xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>

                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/20">
                    <h2 className="text-lg font-bold text-white">{t('share')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><CloseIcon /></button>
                </div>

                <div className="p-4 flex gap-4 bg-black/40 border-b border-gray-800">
                    <div className="relative w-16 h-24 flex-shrink-0 bg-gray-800 rounded overflow-hidden border border-gray-700">
                        <img src={reel.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                    </div>

                    <div className="flex-1 flex flex-col">
                        <textarea
                            placeholder={t('writeMessagePlaceholder')}
                            className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:bg-gray-700 transition-colors resize-none"
                            value={messageText}
                            maxLength={MAX_CHARS}
                            onChange={(e) => setMessageText(e.target.value)}
                        />
                        <div className="text-right mt-1">
                            <span className={`text-[10px] ${messageText.length >= MAX_CHARS ? 'text-red-500' : 'text-gray-500'}`}>
                                {messageText.length}/{MAX_CHARS}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-b border-gray-800">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder={t('searchPlaceholderShort')}
                            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-gray-500 transition-colors placeholder-gray-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 bg-zinc-900">
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500 text-sm">{t('loadingChats')}</div>
                    ) : filteredChats.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">{t('noChatsAvailable')}</div>
                    ) : (
                        <div className="space-y-1">
                            {filteredChats.map(chat => {
                                const partner = chat.participants?.find(p => p.username !== appUser?.username);
                                const name = chat.type === 'GROUP' ? chat.name : partner?.username;
                                const avatar = partner?.profilePictureUrl;
                                const isSelected = selectedChatId === chat.id;

                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => setSelectedChatId(chat.id)}
                                        className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 border ${
                                            isSelected
                                                ? 'bg-gray-800 border-gray-600'
                                                : 'border-transparent hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 overflow-hidden flex-shrink-0 border border-gray-600">
                                            {avatar ? (
                                                <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                    {name?.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`flex-1 text-left font-medium truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                            {name}
                                        </span>

                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                            isSelected
                                                ? 'bg-white border-white'
                                                : 'border-gray-600'
                                        }`}>
                                            {isSelected && <CheckIcon />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800 bg-black/20">
                    <button
                        onClick={handleSend}
                        disabled={!selectedChatId || isSending}
                        className="w-full py-3 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors shadow-lg"
                    >
                        {isSending ? t('sending') : t('send')}
                    </button>
                </div>
            </div>
        </div>
    );
}