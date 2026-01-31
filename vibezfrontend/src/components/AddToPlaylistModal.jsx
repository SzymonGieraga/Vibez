import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/apiClient';

const LoadingSpinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

export default function AddToPlaylistModal({ onClose, appUser, reelToAdd }) {
    const { t } = useTranslation();
    const [playlists, setPlaylists] = useState([]);
    const [playlistsWithReel, setPlaylistsWithReel] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', isError: false });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [processingPlaylistId, setProcessingPlaylistId] = useState(null);

    useEffect(() => {
        if (!appUser?.username) return;
        fetchPlaylists();
    }, [appUser]);

    const fetchPlaylists = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient(`/playlists/user/${appUser.username}?requestingUsername=${appUser.username}`);
            const data = await response.json();
            setPlaylists(data);

            const playlistsContainingReel = new Set();

            data.forEach(playlist => {
                if (playlist.playlistReels && playlist.playlistReels.length > 0) {
                    const hasReel = playlist.playlistReels.some(pr =>
                        pr.reel && pr.reel.id === reelToAdd.id
                    );
                    if (hasReel) {
                        playlistsContainingReel.add(playlist.id);
                    }
                }
            });

            if (playlistsContainingReel.size === 0) {
                const checkResponse = await apiClient(`/playlists/check-reel/${reelToAdd.id}?username=${appUser.username}`);
                if (checkResponse.ok) {
                    const checkData = await checkResponse.json();
                    Object.entries(checkData).forEach(([playlistId, contains]) => {
                        if (contains) {
                            playlistsContainingReel.add(parseInt(playlistId));
                        }
                    });
                }
            }

            setPlaylistsWithReel(playlistsContainingReel);
        } catch (err) {
            console.error('Error fetching playlists:', err);
            setMessage({ text: err.message, isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleReel = async (playlistId, isInPlaylist) => {
        setProcessingPlaylistId(playlistId);
        setMessage({ text: isInPlaylist ? t('removing') : t('adding'), isError: false });

        try {
            const method = isInPlaylist ? 'DELETE' : 'POST';
            await apiClient(`/playlists/${playlistId}/reels/${reelToAdd.id}?username=${appUser.username}`, { method });

            setPlaylistsWithReel(prev => {
                const newSet = new Set(prev);
                if (isInPlaylist) {
                    newSet.delete(playlistId);
                } else {
                    newSet.add(playlistId);
                }
                return newSet;
            });

            setMessage({
                text: isInPlaylist ? t('removedFromPlaylist') : t('addedToPlaylist'),
                isError: false
            });

            setTimeout(() => {
                fetchPlaylists();
                setMessage({ text: '', isError: false });
            }, 1000);
        } catch (err) {
            setMessage({ text: err.message, isError: true });
        } finally {
            setProcessingPlaylistId(null);
        }
    };

    const handleCreateAndAdd = async (formData) => {
        setMessage({ text: t('creatingPlaylist'), isError: false });
        try {
            const params = new URLSearchParams({
                username: appUser.username,
                name: formData.name,
                description: formData.description,
                isPublic: formData.isPublic
            });

            const createResponse = await apiClient(`/playlists?${params.toString()}`, { method: 'POST' });
            const newPlaylist = await createResponse.json();

            await handleToggleReel(newPlaylist.id, false);
            setShowCreateForm(false);
            await fetchPlaylists();
        } catch (err) {
            setMessage({ text: err.message, isError: true });
        }
    };

    return (
        <div className="fixed inset-0  bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="mb-4">
                    <h2 className="text-xl font-bold">{t('addToPlaylist')}</h2>
                    {reelToAdd && (
                        <p className="text-sm text-gray-400 mt-1">
                            {reelToAdd.songTitle} - {reelToAdd.author}
                        </p>
                    )}
                </div>

                {message.text && (
                    <div className={`text-sm mb-4 p-3 rounded-lg ${
                        message.isError
                            ? 'bg-red-900/50 text-red-200 border border-red-700'
                            : 'bg-green-900/50 text-green-200 border border-green-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                {showCreateForm ? (
                    <CreatePlaylistForm
                        onSubmit={handleCreateAndAdd}
                        onCancel={() => setShowCreateForm(false)}
                    />
                ) : (
                    <>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full text-left py-3 px-4 mb-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                        >
                            <PlusIcon />
                            <span>{t('createNewPlaylist')}</span>
                        </button>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <LoadingSpinner />
                                </div>
                            ) : playlists.length > 0 ? (
                                playlists.map(playlist => {
                                    const isInPlaylist = playlistsWithReel.has(playlist.id);
                                    const isProcessing = processingPlaylistId === playlist.id;

                                    return (
                                        <button
                                            key={playlist.id}
                                            onClick={() => handleToggleReel(playlist.id, isInPlaylist)}
                                            disabled={isProcessing}
                                            className={`w-full text-left py-3 px-4 rounded-lg transition-all flex items-center justify-between ${
                                                isInPlaylist
                                                    ? 'bg-green-900/30 border border-green-700 hover:bg-green-900/40'
                                                    : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                                            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{playlist.name}</span>
                                                    {!playlist.isPublic && (
                                                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {t('reelCount', { count: playlist.reelCount || 0 })}
                                                </p>
                                            </div>
                                            <div className="ml-3">
                                                {isProcessing ? (
                                                    <LoadingSpinner />
                                                ) : isInPlaylist ? (
                                                    <CheckIcon />
                                                ) : (
                                                    <PlusIcon />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                    <p className="text-gray-400 mb-4">{t('noPlaylistsYet')}</p>
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="text-blue-400 hover:text-blue-300 font-semibold"
                                    >
                                        {t('createFirstPlaylist')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <button
                                onClick={onClose}
                                className="w-full py-2 px-4 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                {t('close')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function CreatePlaylistForm({ onSubmit, onCancel }) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        await onSubmit({ name, description, isPublic });
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
                label={t('playlistName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('playlistNamePlaceholder')}
                required
            />
            <FormTextarea
                label={t('playlistDescription')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('playlistDescriptionPlaceholder')}
                rows={3}
            />
            <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-900"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-300 cursor-pointer">
                    {t('makePublic')}
                </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="py-2 px-4 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50"
                >
                    {t('cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="py-2 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <LoadingSpinner />
                            <span>{t('creating')}</span>
                        </>
                    ) : (
                        t('createAndAdd')
                    )}
                </button>
            </div>
        </form>
    );
}

const FormInput = ({ label, value, onChange, placeholder, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="block w-full bg-black border border-gray-700 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
    </div>
);

const FormTextarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="block w-full bg-black border border-gray-700 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
    </div>
);