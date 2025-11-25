import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavigationPanel from '../components/NavigationPanel.jsx';
import ReelPreview from '../components/ReelPreview.jsx';
import PlaylistCard from '../components/PlaylistCard.jsx';
import EditProfileModal from '../components/modals/EditProfileModal.jsx';
import EditPlaylistModal from '../components/modals/EditPlaylistModal.jsx';
import FollowListModal from '../components/modals/FollowListModal.jsx';
import { apiClient } from '../api/apiClient';

const EditIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>;
const MenuIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> );

const GridIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
);

const HeartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const PlaylistIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
);

export default function ProfilePage({
                                        auth,
                                        currentUser,
                                        appUser,
                                        setAppUser,
                                        unreadCount,
                                        notifications,
                                        handleMarkAllAsRead,
                                        handleMarkOneAsRead,
                                        totalUnreadChats,
                                        setIsChatModalOpen
                                    }) {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [reels, setReels] = useState([]);
    const [likedReels, setLikedReels] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [activeTab, setActiveTab] = useState('reels');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingLiked, setIsLoadingLiked] = useState(false);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [isEditPlaylistModalOpen, setIsEditPlaylistModalOpen] = useState(false);
    const [playlistToEdit, setPlaylistToEdit] = useState(null);

    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const [followModal, setFollowModal] = useState({
        isOpen: false,
        mode: 'followers',
    });

    const isOwnProfile = appUser?.username === username;

    const fetchFollowStats = async (profileUsername) => {
        try {
            const statsRes = await apiClient(`/follows/stats/${profileUsername}`);
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setFollowStats(statsData);
            }
        } catch (error) {
            console.error("Error fetching follow stats:", error);
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                const [profileRes, reelsRes] = await Promise.all([
                    apiClient(`/users/${username}`),
                    apiClient(`/reels/user/${username}`),
                ]);

                const profileData = await profileRes.json();
                const reelsData = await reelsRes.json();

                setProfile(profileData);
                setReels(reelsData);
                fetchFollowStats(username);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setProfile(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [username]);

    useEffect(() => {
        if (!isOwnProfile && appUser && profile) {
            const fetchFollowStatus = async () => {
                try {
                    const res = await apiClient(`/follows/status?followerUsername=${appUser.username}&followingUsername=${profile.username}`);
                    if (res.ok) {
                        const data = await res.json();
                        setIsFollowing(data.isFollowing);
                    }
                } catch (error) {
                    console.error("Error fetching follow status:", error);
                }
            };
            fetchFollowStatus();
        }
    }, [isOwnProfile, appUser, profile]);

    useEffect(() => {
        if (activeTab === 'liked' && likedReels.length === 0) {
            fetchLikedReels();
        }
        if (activeTab === 'playlists' && playlists.length === 0 && appUser) {
            fetchPlaylists();
        }
    }, [activeTab, appUser]);

    const fetchLikedReels = async () => {
        setIsLoadingLiked(true);
        try {
            const response = await apiClient(`/reels/liked/${username}`);
            if (response.ok) {
                const data = await response.json();
                setLikedReels(data);
            }
        } catch (error) {
            console.error("Error fetching liked reels:", error);
        } finally {
            setIsLoadingLiked(false);
        }
    };

    const fetchPlaylists = async () => {
        if (!appUser) return;
        setIsLoadingPlaylists(true);
        try {
            const response = await apiClient(`/playlists/user/${username}?requestingUsername=${appUser.username}`);
            if (response.ok) {
                const data = await response.json();
                setPlaylists(data);
            }
        } catch (error) {
            console.error("Error fetching playlists:", error);
        } finally {
            setIsLoadingPlaylists(false);
        }
    };

    const handlePlaylistUpdate = (updatedPlaylist) => {
        setPlaylists(prevPlaylists =>
            prevPlaylists.map(p => {
                if (p.id === updatedPlaylist.id) {
                    return {
                        ...p,
                        name: updatedPlaylist.name,
                        description: updatedPlaylist.description,
                        public: updatedPlaylist.public
                    };
                }
                return p;
            })
        );

        if (selectedPlaylist && selectedPlaylist.id === updatedPlaylist.id) {
            setSelectedPlaylist(prevSelected => ({
                ...prevSelected,
                name: updatedPlaylist.name,
                description: updatedPlaylist.description,
                public: updatedPlaylist.public
            }));
        }

        setIsEditPlaylistModalOpen(false);
        setPlaylistToEdit(null);
    };

    const handlePlaylistDelete = (deletedPlaylistId) => {
        setPlaylists(prev => prev.filter(p => p.id !== deletedPlaylistId));
        setSelectedPlaylist(null);
        setIsEditPlaylistModalOpen(false);
        setPlaylistToEdit(null);
    };

    const handleToggleFollow = async () => {
        if (!appUser) {
            console.error("User not logged in");
            return;
        }
        setIsFollowLoading(true);
        try {
            const res = await apiClient(`/follows/toggle?followerUsername=${appUser.username}&followingUsername=${profile.username}`, {
                method: 'POST'
            });

            if (res.ok) {
                const data = await res.json();
                setIsFollowing(data.isFollowing);
                fetchFollowStats(profile.username);
            } else {
                const errData = await res.json();
                console.error("Failed to toggle follow:", errData.error);
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
        } finally {
            setIsFollowLoading(false);
        }
    };

    const openFollowModal = (mode) => {
        if (!appUser) return;
        setFollowModal({ isOpen: true, mode: mode });
    };

    const handleModalClose = () => {
        setFollowModal({ isOpen: false, mode: 'followers' });
        if (isOwnProfile) {
            fetchFollowStats(username);
        }
    };

    const handleFollowUpdateFromModal = () => {
        if (!isOwnProfile) {
            fetchFollowStats(username);
        }
    };

    const displayedReels = activeTab === 'reels' ? reels : likedReels;

    if (isLoading) {
        return <div className="bg-black text-white flex items-center justify-center h-screen">Loading Profile...</div>;
    }

    if (!profile) {
        return <div className="bg-black text-white flex items-center justify-center h-screen">Profile not found.</div>;
    }

    return (
        <div className="w-screen h-screen bg-black text-white relative overflow-hidden">
            <main className="w-full h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
                    <header className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                        <img
                            src={profile.profilePictureUrl || `https://ui-avatars.com/api/?name=${profile.username}&background=222&color=fff&size=128`}
                            alt="Profile"
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-gray-700"
                        />
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold">{profile.username}</h1>
                            <p className="text-gray-400 mt-2 max-w-md">{profile.bio || "No bio yet."}</p>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4">

                                <div className="flex gap-6 justify-center sm:justify-start text-sm">
                                    <div>
                                        <span className="font-bold">{reels.length}</span>
                                        <span className="text-gray-400 ml-1">reels</span>
                                    </div>
                                    <div onClick={() => openFollowModal('followers')} className="cursor-pointer hover:text-gray-300">
                                        <span className="font-bold">{followStats.followers}</span>
                                        <span className="text-gray-400 ml-1">followers</span>
                                    </div>
                                    <div onClick={() => openFollowModal('following')} className="cursor-pointer hover:text-gray-300">
                                        <span className="font-bold">{followStats.following}</span>
                                        <span className="text-gray-400 ml-1">following</span>
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-0">
                                    {isOwnProfile ? (
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center mx-auto sm:mx-0"
                                        >
                                            <EditIcon /> Edit Profile
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleToggleFollow}
                                            disabled={isFollowLoading || !appUser}
                                            className={`text-sm font-semibold py-2 px-6 rounded-lg ${
                                                isFollowing
                                                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                                                    : 'bg-white hover:bg-gray-200 text-black'
                                            } disabled:opacity-50 mx-auto sm:mx-0 transition-colors`}
                                        >
                                            {isFollowLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
                                        </button>
                                    )}
                                </div>

                            </div>

                        </div>
                    </header>

                    <div className="border-t border-gray-800">
                        <div className="flex justify-center gap-12 -mb-px">
                            <button
                                onClick={() => { setActiveTab('reels'); setSelectedPlaylist(null); }}
                                className={`flex items-center gap-2 py-4 border-t-2 transition-colors ${
                                    activeTab === 'reels'
                                        ? 'border-white text-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <GridIcon />
                                <span className="text-xs font-semibold uppercase tracking-wider">Reels</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('liked'); setSelectedPlaylist(null); }}
                                className={`flex items-center gap-2 py-4 border-t-2 transition-colors ${
                                    activeTab === 'liked'
                                        ? 'border-white text-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <HeartIcon />
                                <span className="text-xs font-semibold uppercase tracking-wider">Liked</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('playlists'); setSelectedPlaylist(null); }}
                                className={`flex items-center gap-2 py-4 border-t-2 transition-colors ${
                                    activeTab === 'playlists'
                                        ? 'border-white text-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <PlaylistIcon />
                                <span className="text-xs font-semibold uppercase tracking-wider">Playlists</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-6">
                        {activeTab === 'reels' && (
                            displayedReels.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                                    {displayedReels.map(reel => (
                                        <ReelPreview key={reel.id} reel={reel} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="mb-4"><GridIcon /></div>
                                    <p className="text-lg font-semibold mb-1">No reels yet</p>
                                    <p className="text-sm">Start sharing your music!</p>
                                </div>
                            )
                        )}

                        {activeTab === 'liked' && (
                            isLoadingLiked ? (
                                <div className="text-center py-12 text-gray-500">
                                    <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p>Loading...</p>
                                </div>
                            ) : displayedReels.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                                    {displayedReels.map(reel => (
                                        <ReelPreview key={reel.id} reel={reel} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="mb-4"><HeartIcon /></div>
                                    <p className="text-lg font-semibold mb-1">No liked reels</p>
                                    <p className="text-sm">Reels you like will appear here</p>
                                </div>
                            )
                        )}

                        {activeTab === 'playlists' && (
                            <>
                                {isLoadingPlaylists ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p>Loading playlists...</p>
                                    </div>
                                ) : selectedPlaylist ? (
                                    <div>
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                                            <div>
                                                <button
                                                    onClick={() => setSelectedPlaylist(null)}
                                                    className="text-sm text-gray-400 hover:text-white mb-2"
                                                >
                                                    &larr; Back to Playlists
                                                </button>
                                                <h2 className="text-3xl font-bold">{selectedPlaylist.name}</h2>
                                                <p className="text-gray-400 text-sm mt-1">{selectedPlaylist.description || "No description."}</p>
                                            </div>
                                            {isOwnProfile && (
                                                <div className="flex-shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setPlaylistToEdit(selectedPlaylist);
                                                            setIsEditPlaylistModalOpen(true);
                                                        }}
                                                        className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center"
                                                    >
                                                        <EditIcon /> Edit Playlist
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {selectedPlaylist.playlistReels.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                                                {selectedPlaylist.playlistReels
                                                    .map(pr => (
                                                        <ReelPreview key={pr.reel.id} reel={pr.reel} />
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                <p className="text-lg font-semibold">This playlist is empty.</p>
                                                <p className="text-sm">Add some reels to see them here.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : playlists.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {playlists.map(playlist => (
                                            <PlaylistCard
                                                key={playlist.id}
                                                playlist={playlist}
                                                onClick={() => setSelectedPlaylist(playlist)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="mb-4 mx-auto w-6 h-6"><PlaylistIcon /></div>
                                        <p className="text-lg font-semibold mb-1">No playlists yet</p>
                                        <p className="text-sm">Playlists you create will appear here.</p>
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>
            </main>

            <div className="absolute top-4 left-4 z-30">
                <button onClick={() => setIsNavOpen(true)} className="p-2 bg-black/30 rounded-full hover:bg-black/50">
                    <MenuIcon />
                </button>
            </div>

            <NavigationPanel
                user={currentUser}
                auth={auth}
                appUser={appUser}
                isOpen={isNavOpen}
                unreadCount={unreadCount}
                notifications={notifications}
                handleMarkAllAsRead={handleMarkAllAsRead}
                handleMarkOneAsRead={handleMarkOneAsRead}
                totalUnreadChats={totalUnreadChats}
                setIsChatModalOpen={setIsChatModalOpen}
            />

            {isNavOpen && <div className="absolute inset-0 bg-black/30 z-20" onClick={() => setIsNavOpen(false)} />}

            {isEditModalOpen && (
                <EditProfileModal
                    user={profile}
                    onClose={() => setIsEditModalOpen(false)}
                    onProfileUpdate={setAppUser}
                />
            )}

            {isEditPlaylistModalOpen && playlistToEdit && appUser && (
                <EditPlaylistModal
                    playlist={playlistToEdit}
                    user={appUser}
                    onClose={() => {
                        setIsEditPlaylistModalOpen(false);
                        setPlaylistToEdit(null);
                    }}
                    onUpdate={handlePlaylistUpdate}
                    onDelete={handlePlaylistDelete}
                />
            )}
            {followModal.isOpen && appUser && (
                <FollowListModal
                    mode={followModal.mode}
                    profileUsername={profile.username}
                    currentUsername={appUser.username}
                    onClose={handleModalClose}
                    onFollowUpdate={handleFollowUpdateFromModal}
                />
            )}
        </div>
    );
}