import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const EditIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>;
const MenuIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> );
const HomeIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> );
const ProfileIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> );
const PopularIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> );
const SettingsIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );

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


const ReelPreview = ({ reel }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const hoverTimerRef = useRef(null);
    const frameIntervalRef = useRef(null);
    const audioRef = useRef(null);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [audioBlocked, setAudioBlocked] = useState(false);

    useEffect(() => {
        if (isHovering) {
            hoverTimerRef.current = setTimeout(async () => {
                setIsLoading(true);
                try {
                    const response = await fetch(`http://localhost:8080/api/reels/${reel.id}/preview`);
                    if (response.ok) {
                        const preview = await response.json();
                        if (preview.frameUrls && preview.frameUrls.length > 0) {
                            setPreviewData(preview);
                            setShowPreview(true);
                            startFrameAnimation(preview.frameUrls.length);
                            loadAudio();
                        }
                    }
                } catch (error) {
                    console.error('Failed to load preview:', error);
                } finally {
                    setIsLoading(false);
                }
            }, 3000);
        } else {
            if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
            }
            stopPreview();
        }

        return () => {
            if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
            }
            stopPreview();
        };
    }, [isHovering, reel.id]);

    const startFrameAnimation = (frameCount) => {
        setCurrentFrame(0);
        frameIntervalRef.current = setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % frameCount);
        }, 500);
    };

    const stopPreview = () => {
        setShowPreview(false);
        setCurrentFrame(0);
        setPreviewData(null);
        setIsLoading(false);

        if (frameIntervalRef.current) {
            clearInterval(frameIntervalRef.current);
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const loadAudio = () => {
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
            audioRef.current.muted = false;

            const playPromise = audioRef.current.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setAudioEnabled(true);
                        setAudioBlocked(false);
                    })
                    .catch(error => {
                        console.log('Audio autoplay prevented:', error);
                        setAudioBlocked(true);
                        setAudioEnabled(false);
                    });
            }
        }
    };

    const enableAudio = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setAudioEnabled(true);
            setAudioBlocked(false);
        }
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (audioEnabled) {
                audioRef.current.pause();
                setAudioEnabled(false);
            } else {
                audioRef.current.play();
                setAudioEnabled(true);
            }
        }
    };

    return (
        <div
            className="aspect-w-9 aspect-h-16 bg-gray-900 group relative overflow-hidden cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <img
                src={reel.thumbnailUrl || 'https://placehold.co/360x640/1a1a1a/ffffff?text=No+Thumbnail'}
                alt={reel.description}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                    showPreview ? 'opacity-0' : 'opacity-100'
                }`}
            />

            {showPreview && previewData && previewData.frameUrls && (
                <>
                    <img
                        src={previewData.frameUrls[currentFrame]}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <audio ref={audioRef} src={reel.videoUrl} loop />

                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {currentFrame + 1}/{previewData.frameUrls.length}
                    </div>
                </>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                <p className="text-white text-sm font-bold text-center">{reel.songTitle}</p>
            </div>

            {(isHovering && !showPreview) && (
                <div className="absolute bottom-2 right-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {showPreview && (
                <div className="absolute top-2 right-2 flex gap-1">
                    {audioBlocked && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                enableAudio();
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-full p-1 transition-colors"
                            title="Click to enable audio"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}

                    {!audioBlocked && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleAudio();
                            }}
                            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                            title={audioEnabled ? "Mute" : "Unmute"}
                        >
                            {audioEnabled ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const PlaylistCard = ({ playlist, onClick }) => {
    const thumbnailUrl = playlist.playlistReels.length > 0
        ? playlist.playlistReels[0].reel.thumbnailUrl
        : `https://placehold.co/400x400/1a1a1a/ffffff?text=${encodeURIComponent(playlist.name)}`;

    return (
        <div
            onClick={onClick}
            className="aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-pointer group relative shadow-lg"
        >
            <img
                src={thumbnailUrl}
                alt={playlist.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                <h3 className="font-bold text-lg text-white truncate">{playlist.name}</h3>
                <p className="text-xs text-gray-300">
                    {playlist.playlistReels.length} {playlist.playlistReels.length === 1 ? 'reel' : 'reels'}
                </p>
            </div>
        </div>
    );
};

export default function ProfilePage({ auth, currentUser, appUser, setAppUser }) {
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

    const isOwnProfile = appUser?.username === username;

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                const [profileRes, reelsRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/users/${username}`),
                    fetch(`http://localhost:8080/api/reels/user/${username}`)
                ]);

                if (!profileRes.ok) throw new Error(`Profile not found for ${username}`);
                if (!reelsRes.ok) throw new Error(`Reels not found for ${username}`);

                const profileData = await profileRes.json();
                const reelsData = await reelsRes.json();

                setProfile(profileData);
                setReels(reelsData);
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
            const response = await fetch(`http://localhost:8080/api/reels/liked/${username}`);
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
            const response = await fetch(`http://localhost:8080/api/playlists/user/${username}?requestingUsername=${appUser.username}`);
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
        setSelectedPlaylist(null); // Wróć do listy playlist
        setIsEditPlaylistModalOpen(false);
        setPlaylistToEdit(null);
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

                            {/* Stats */}
                            <div className="flex gap-6 mt-4 justify-center sm:justify-start text-sm">
                                <div>
                                    <span className="font-bold">{reels.length}</span>
                                    <span className="text-gray-400 ml-1">reels</span>
                                </div>
                            </div>

                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="mt-4 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center mx-auto sm:mx-0"
                                >
                                    <EditIcon /> Edit Profile
                                </button>
                            )}
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

                        {/* Zakładka Liked */}
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
            <nav className={`absolute top-0 left-0 h-full w-72 bg-black/80 backdrop-blur-md border-r border-gray-800 p-6 flex flex-col justify-between transition-transform duration-300 z-40 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <h1 className="text-2xl font-bold mb-10">Vibez</h1>
                    <ul className="space-y-4">
                        <NavItem icon={<HomeIcon />} label="Main Page" to="/" />
                        <NavItem icon={<ProfileIcon />} label="Your Profile" to={`/profile/${appUser.username}`} />
                        <NavItem icon={<PopularIcon />} label="Popular" to="#" />
                        <NavItem icon={<SettingsIcon />} label="Settings" to="#" />
                    </ul>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Logged in as:</p>
                    <p className="text-sm font-bold truncate">{currentUser.email}</p>
                    <button onClick={async () => await signOut(auth)} className="w-full mt-4 text-left text-sm text-gray-400 hover:text-white">Logout</button>
                </div>
            </nav>
            {isNavOpen && <div className="absolute inset-0 bg-black/30 z-20" onClick={() => setIsNavOpen(false)} />}

            {isEditModalOpen && <EditProfileModal user={profile} onClose={() => setIsEditModalOpen(false)} onProfileUpdate={setAppUser} />}

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
        </div>
    );
}

const NavItem = ({ icon, label, to }) => (
    <li>
        <Link to={to} className="flex items-center space-x-3 text-gray-400 hover:text-white cursor-pointer">
            {icon}
            <span className="font-semibold">{label}</span>
        </Link>
    </li>
);

function EditProfileModal({ user, onClose, onProfileUpdate }) {
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

            const updateRes = await fetch(`http://localhost:8080/api/users/${user.username}`, {
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

// --- NOWY MODAL EDYCJI PLAYLISTY ---
function EditPlaylistModal({ playlist, user, onClose, onUpdate, onDelete }) {
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
            const res = await fetch(`http://localhost:8080/api/playlists/${playlist.id}?${params.toString()}`, {
                method: 'PUT'
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to update playlist');
            }
            const updatedPlaylist = await res.json();
            onUpdate(updatedPlaylist);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${playlist.name}"? This cannot be undone.`)) {
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ username: user.username });
            const res = await fetch(`http://localhost:8080/api/playlists/${playlist.id}?${params.toString()}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to delete playlist');
            }
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
                <h2 className="text-xl font-bold mb-6">Edit Playlist</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Description</label>
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
                            Public Playlist
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
                            {isLoading ? 'Deleting...' : 'Delete Playlist'}
                        </button>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="mr-4 py-2 px-4 text-sm font-medium text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="py-2 px-6 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-500"
                            >
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}