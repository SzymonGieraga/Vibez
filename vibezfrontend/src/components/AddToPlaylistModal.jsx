import React, { useState, useEffect } from 'react';

const LoadingSpinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function AddToPlaylistModal({ onClose, appUser, reelToAdd }) {
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', isError: false });
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        if (!appUser?.username) return;

        const fetchPlaylists = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/api/playlists/user/${appUser.username}?requestingUsername=${appUser.username}`);
                if (!response.ok) throw new Error('Could not fetch playlists');
                const data = await response.json();
                setPlaylists(data);
            } catch (err) {
                setMessage({ text: err.message, isError: true });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylists();
    }, [appUser]);

    // Handler dodawania do istniejącej playlisty
    const handleAddToExisting = async (playlistId) => {
        setMessage({ text: 'Adding...', isError: false });
        try {
            const response = await fetch(`http://localhost:8080/api/playlists/${playlistId}/reels/${reelToAdd.id}?username=${appUser.username}`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (errorText.includes("already in playlist")) {
                    throw new Error('Reel is already in this playlist');
                }
                throw new Error('Failed to add reel');
            }

            setMessage({ text: 'Added to playlist!', isError: false });
            setTimeout(onClose, 1000);
        } catch (err) {
            setMessage({ text: err.message, isError: true });
        }
    };

    // Handler tworzenia nowej playlisty i dodawania do niej
    const handleCreateAndAdd = async (formData) => {
        setMessage({ text: 'Creating playlist...', isError: false });
        try {
            const params = new URLSearchParams({
                username: appUser.username,
                name: formData.name,
                description: formData.description,
                isPublic: formData.isPublic
            });

            const createResponse = await fetch(`http://localhost:8080/api/playlists?${params.toString()}`, {
                method: 'POST'
            });
            if (!createResponse.ok) throw new Error('Failed to create playlist');

            const newPlaylist = await createResponse.json();

            await handleAddToExisting(newPlaylist.id);

        } catch (err) {
            setMessage({ text: err.message, isError: true });
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Add to Playlist</h2>

                {message.text && (
                    <p className={`text-sm mb-4 ${message.isError ? 'text-red-500' : 'text-green-500'}`}>
                        {message.text}
                    </p>
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
                            className="w-full text-left py-2 px-3 mb-2 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold"
                        >
                            [+] Create New Playlist
                        </button>

                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                playlists.length > 0 ? (
                                    playlists.map(playlist => (
                                        <button
                                            key={playlist.id}
                                            onClick={() => handleAddToExisting(playlist.id)}
                                            className="w-full text-left py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-md"
                                        >
                                            {playlist.name}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-gray-400">You don't have any playlists yet.</p>
                                )
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Sub-komponent formularza
function CreatePlaylistForm({ onSubmit, onCancel }) {
    // ... (cały kod CreatePlaylistForm bez zmian) ...
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
                label="Playlist Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <FormInput
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-300">Make playlist public</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="py-2 px-4 text-sm font-medium text-gray-400 hover:text-white"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-500"
                >
                    {isSubmitting ? <LoadingSpinner /> : 'Create & Add'}
                </button>
            </div>
        </form>
    );
}

const FormInput = ({ label, value, onChange, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            required={required}
            className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
    </div>
);