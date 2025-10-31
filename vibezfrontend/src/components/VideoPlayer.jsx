import React, { useState, useEffect, useRef } from 'react';

// Ikony specyficzne dla odtwarzacza
const MuteIcon = () => ( <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l4-4m0 4l-4-4" /></svg> );
const UnmuteIcon = () => ( <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-1.464a5 5 0 010-7.072" /></svg> );
const PlayIcon = () => ( <svg className="w-20 h-20 text-white opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> );
const HeartIcon = ({ isLiked }) => (
    <svg
        className={`w-8 h-8 ${isLiked ? 'text-red-500' : ''}`}
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
);
const CommentIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const BookmarkIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


export default function VideoPlayer({ videos, volume, setVolume, setIsCommentsOpen, appUser, likedReelIds, onLikeToggle, isTogglingLike, currentVideoIndex, setCurrentVideoIndex,onOpenPlaylistModal }) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [touchStart, setTouchStart] = useState(0);

    const videoRef = useRef(null);
    const progressRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => { if (video.duration) setProgress((video.currentTime / video.duration) * 100); };
        const handleVideoEnd = () => goToNextVideo();
        const handleLoadedData = () => {
            video.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleVideoEnd);
        video.addEventListener('loadeddata', handleLoadedData);

        video.volume = volume;

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleVideoEnd);
            video.removeEventListener('loadeddata', handleLoadedData);
        };
    }, [currentVideoIndex, volume, videos]);

    useEffect(() => { if(videoRef.current) videoRef.current.volume = volume; }, [volume]);

    if (!videos || videos.length === 0) {
        return <div className="text-gray-500 flex items-center justify-center h-full">Loading videos...</div>;
    }

    const currentVideo = videos[currentVideoIndex];
    if (!currentVideo) {
        return <div className="text-gray-500 flex items-center justify-center h-full">No video to display.</div>;
    }

    const isLiked = likedReelIds.has(currentVideo.id);

    const goToNextVideo = () => setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    const goToPrevVideo = () => setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play(); setIsPlaying(true);
        } else {
            videoRef.current.pause(); setIsPlaying(false);
        }
    };

    const handleSeek = (e) => {
        const progressContainer = progressRef.current;
        const video = videoRef.current;
        if (!progressContainer || !video || !video.duration) return;
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        video.currentTime = (clickX / rect.width) * video.duration;
    };

    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientY);
    const handleTouchEnd = (e) => {
        const touchEnd = e.changedTouches[0].clientY;
        const deltaY = touchStart - touchEnd;
        if (deltaY > 50) setIsDetailsVisible(true);
        else if (deltaY < -50) setIsDetailsVisible(false);
    };

    return (
        <div className="w-full h-full bg-black flex flex-col relative group" onClick={togglePlay} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <video ref={videoRef} key={currentVideo.id} className="w-full h-full object-cover" src={currentVideo.videoUrl} muted={volume === 0} playsInline />

            <button onClick={(e) => { e.stopPropagation(); goToPrevVideo(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); goToNextVideo(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-between p-4 pointer-events-none">
                <div></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{!isPlaying && <PlayIcon />}</div>
                <div className="text-white pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="cursor-pointer" onClick={() => setIsDetailsVisible(true)}>
                        <p className="font-bold text-sm">@{currentVideo.username}</p>
                        <p className="text-xs text-gray-300">{currentVideo.songTitle} by {currentVideo.author}</p>
                        <p className="text-xs text-gray-400 mt-1 truncate">{currentVideo.description}</p>
                    </div>
                    <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 z-10">
                        <InteractionButton
                            icon={<HeartIcon isLiked={isLiked} />}
                            count={currentVideo.likeCount}
                            onClick={(e) => {
                                e.stopPropagation();
                                onLikeToggle(currentVideo.id, isLiked);
                            }}
                            disabled={isTogglingLike}
                        />
                        <InteractionButton icon={<CommentIcon />} count={currentVideo.comments?.length || 0} onClick={() => setIsCommentsOpen(true)} />
                        <InteractionButton
                            icon={<BookmarkIcon />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenPlaylistModal(currentVideo);
                            }}
                        />
                    </div>
                    <div ref={progressRef} onClick={handleSeek} className="w-full bg-gray-500 bg-opacity-50 h-1.5 rounded-full mt-2 cursor-pointer">
                        <div style={{ width: `${progress}%` }} className="h-full bg-white rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setVolume(v => v > 0 ? 0 : 0.5)}>{volume > 0 ? <UnmuteIcon /> : <MuteIcon />}</button>
                            <input type="range" min="0" max="100" value={volume * 100} onChange={(e) => setVolume(parseFloat(e.target.value) / 100)} className="w-24 h-1.5 accent-white" />
                        </div>
                    </div>
                </div>
            </div>

            <ExpandedDetailsPanel video={currentVideo} isVisible={isDetailsVisible} onClose={() => setIsDetailsVisible(false)} />
        </div>
    );
};

const InteractionButton = ({ icon, count, onClick, disabled = false }) => (
    <div className="flex flex-col items-center" onClick={!disabled ? onClick : null}>
        <button
            className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center text-white disabled:opacity-50"
            disabled={disabled}>
            {icon}
        </button>
        <span className="text-xs font-semibold mt-1">{count}</span>
    </div>
);

const ExpandedDetailsPanel = ({ video, isVisible, onClose }) => (
    <div className={`absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-sm p-4 rounded-t-2xl transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`} onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose}></div>
        <div className="text-left text-sm space-y-2">
            <DetailRow label="Song" value={`${video.songTitle} by ${video.author}`} />
            <DetailRow label="Genre" value={video.genre} />
            <DetailRow label="Posted by" value={`@${video.username}`} />
            <div><p className="font-bold text-gray-400">Description</p><p className="text-white whitespace-pre-wrap">{video.description}</p></div>
            {video.tags && (
                <div>
                    <p className="font-bold text-gray-400">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {video.tags.map(tag => (
                            <span key={tag.id} className="bg-gray-700 text-gray-200 text-xs px-2 py-0.5 rounded-full">#{tag.name}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
);

const DetailRow = ({ label, value }) => ( <div><p className="font-bold text-gray-400">{label}</p><p className="text-white">{value}</p></div> );

function AddToPlaylistModal({ onClose, appUser, reelToAdd }) {
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

    const handleAddToExisting = async (playlistId) => {
        setMessage({ text: 'Adding...', isError: false });
        try {
            const response = await fetch(`http://localhost:8080/api/playlists/${playlistId}/reels/${reelToAdd.id}?username=${appUser.username}`, {
                method: 'POST'
            });

            if (!response.ok) {
                if (response.status === 400 || response.status === 500) {
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
                    // Widok tworzenia nowej
                    <CreatePlaylistForm
                        onSubmit={handleCreateAndAdd}
                        onCancel={() => setShowCreateForm(false)}
                    />
                ) : (
                    // Widok listy istniejących
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

function CreatePlaylistForm({ onSubmit, onCancel }) {
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