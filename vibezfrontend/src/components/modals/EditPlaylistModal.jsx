import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/apiClient';

export default function EditPlaylistModal({ playlist, user, onClose, onUpdate, onDelete }) {
    const { t } = useTranslation();
    const [name, setName] = useState(playlist.name);
    const [description, setDescription] = useState(playlist.description || '');
    const [isPublic, setIsPublic] = useState(playlist.public);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                username: user.username,
                name: name,
                description: description,
                isPublic: isPublic
            });

            const res = await apiClient(`/playlists/${playlist.id}?${params.toString()}`, {
                method: 'PUT'
            });

            const updatedPlaylist = await res.json();
            onUpdate(updatedPlaylist);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t('deletePlaylistConfirm', { name: playlist.name }))) {
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ username: user.username });

            await apiClient(`/playlists/${playlist.id}?${params.toString()}`, {
                method: 'DELETE'
            });

            onDelete(playlist.id);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 p-8 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6">{t('editPlaylist')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">{t('name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">{t('description')}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            id="isPublicCheckbox"
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="h-4 w-4 text-gray-600 border-gray-700 rounded bg-black focus:ring-gray-500"
                        />
                        <label htmlFor="isPublicCheckbox" className="ml-2 block text-sm text-gray-400">
                            {t('publicPlaylist')}
                        </label>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-between items-center pt-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="py-2 px-4 text-sm font-medium text-red-500 hover:text-red-400 disabled:text-gray-600"
                        >
                            {isLoading ? t('deleting') : t('deletePlaylist')}
                        </button>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="mr-4 py-2 px-4 text-sm font-medium text-gray-400 hover:text-white"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="py-2 px-6 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-500"
                            >
                                {isLoading ? t('saving') : t('save')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}