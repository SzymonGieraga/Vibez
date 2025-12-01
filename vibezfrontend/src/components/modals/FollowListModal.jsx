import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/apiClient';

export default function FollowListModal({ mode, profileUsername, currentUsername, onClose, onFollowUpdate }) {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`http://localhost:8080/api/follows/${profileUsername}/${mode}?currentUsername=${currentUsername}`);
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error(`Error fetching ${mode}:`, error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [mode, profileUsername, currentUsername]);

    const handleToggleFollow = async (targetUsername, index) => {
        try {
            const res = await apiClient(`/follows/toggle?followerUsername=${currentUsername}&followingUsername=${targetUsername}`, {
                method: 'POST'
            });

            if (res.ok) {
                const data = await res.json();

                setUsers(currentUsers =>
                    currentUsers.map((user, i) =>
                        i === index
                            ? { ...user, isFollowedByCurrentUser: data.isFollowing }
                            : user
                    )
                );

                if (targetUsername === profileUsername) {
                    onFollowUpdate();
                }

            } else {
                console.error("Failed to toggle follow from modal");
            }
        } catch (error) {
            console.error("Error toggling follow from modal:", error);
        }
    };

    const handleNavigate = (username) => {
        onClose();
        navigate(`/profile/${username}`);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl w-full max-w-sm h-[60vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold capitalize">{t(mode)}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {isLoading ? (
                        <p className="text-gray-400 text-center">{t('loading')}</p>
                    ) : users.length === 0 ? (
                        <p className="text-gray-400 text-center">{t('noUsersFound')}</p>
                    ) : (
                        users.map((user, index) => (
                            <UserListItem
                                key={user.username}
                                user={user}
                                currentUsername={currentUsername}
                                onToggleFollow={() => handleToggleFollow(user.username, index)}
                                onNavigate={() => handleNavigate(user.username)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function UserListItem({ user, currentUsername, onToggleFollow, onNavigate }) {
    const { t } = useTranslation();
    const isCurrentUser = user.username === currentUsername;

    return (
        <div className="flex items-center justify-between gap-4">
            <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={onNavigate}
            >
                <img
                    src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.username}&background=222&color=fff&size=40`}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold hover:underline">{user.username}</span>
            </div>

            {!isCurrentUser && (
                <button
                    onClick={onToggleFollow}
                    className={`text-sm font-semibold py-1.5 px-4 rounded-lg ${
                        user.isFollowedByCurrentUser
                            ? 'bg-gray-800 hover:bg-gray-700 text-white'
                            : 'bg-white hover:bg-gray-200 text-black'
                    } transition-colors flex-shrink-0`}
                >
                    {user.isFollowedByCurrentUser ? t('followingState') : t('follow')}
                </button>
            )}
        </div>
    );
}