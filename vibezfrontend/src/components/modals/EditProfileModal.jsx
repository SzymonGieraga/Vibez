import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function EditProfileModal({ user, onClose, onProfileUpdate }) {
    const [newUsername, setNewUsername] = useState(user.username);
    const [bio, setBio] = useState(user.bio || '');
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', newUsername);
            formData.append('bio', bio);

            if (profilePicFile) {
                formData.append('profilePicture', profilePicFile);
            }

            const updateRes = await apiClient(`/users/${user.username}`, {
                method: 'PUT',
                body: formData
            });

            if (updateRes.status === 409) {
                throw new Error('Username already taken.');
            }
            if (!updateRes.ok) {
                throw new Error('Failed to update profile.');
            }

            const updatedProfile = await updateRes.json();
            onProfileUpdate(updatedProfile);
            onClose();

            if (newUsername !== user.username) {
                navigate(`/profile/${newUsername}`, { replace: true });
            }

        } catch (err) {
            setError(err.message);
            console.error("Error updating profile:", err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 p-8 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Username</label>
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            required
                            className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Profile Picture</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfilePicFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows="3"
                            className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUploading}
                            className="mr-4 py-2 px-4 text-sm font-medium text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="py-2 px-6 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-500"
                        >
                            {isUploading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}