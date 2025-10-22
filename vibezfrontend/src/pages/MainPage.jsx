import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

// --- Ikony ---
const HomeIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> );
const ProfileIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> );
const PopularIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> );
const SettingsIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const MuteIcon = () => ( <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l4-4m0 4l-4-4" /></svg> );
const UnmuteIcon = () => ( <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-1.464a5 5 0 010-7.072" /></svg> );
const PlayIcon = () => ( <svg className="w-20 h-20 text-white opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> );
const PlusIcon = () => ( <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> );
const MenuIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> );
const TagIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM17 11h.01M17 7h5a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5a2 2 0 012-2zM7 17h.01M7 13h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z" /></svg> );
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
const SmallHeartIcon = ({ isLiked, disabled }) => (
    <svg
        className={`w-4 h-4 inline -mt-0.5 ${isLiked ? 'text-red-500' : 'text-gray-500'} ${disabled ? 'opacity-50' : 'hover:text-white'}`}
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
);
const CommentIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;


export default function MainPage({ user, auth, appUser }) {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isAsideOpen, setIsAsideOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [videos, setVideos] = useState([]);
    const [volume, setVolume] = useState(0);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [likedReelIds, setLikedReelIds] = useState(new Set());
    const [isTogglingLike, setIsTogglingLike] = useState(false);

    const fetchVideos = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/reels');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setVideos(data);
            setCurrentVideoIndex(0);
        } catch (error) { console.error("Błąd podczas pobierania filmów:", error); }
    };

    const fetchLikedReels = async (username) => {
        if (!username) return;
        try {
            const response = await fetch(`http://localhost:8080/api/reels/liked/${username}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const likedReels = await response.json(); // Oczekuje Listy<Reel>
            const idSet = new Set(likedReels.filter(reel => reel != null).map(reel => reel.id));
            setLikedReelIds(idSet);
        } catch (error) {
            console.error("Błąd podczas pobierania polubionych filmów:", error);
        }
    };

    useEffect(() => {
        fetchVideos();
        if (appUser?.username) {
            fetchLikedReels(appUser.username);
        }
    }, [appUser]);

    const handleLikeToggle = async (reelId, isCurrentlyLiked) => {
        if (!appUser?.username) {
            console.log("Musisz być zalogowany, aby polubić.");
            return;
        }

        setIsTogglingLike(true);

        const username = appUser.username;
        const method = isCurrentlyLiked ? 'DELETE' : 'POST';
        const url = `http://localhost:8080/api/reels/${reelId}/like?username=${username}`;

        try {
            const response = await fetch(url, { method });
            if (!response.ok) throw new Error('Failed to update like status');

            const updatedReel = await response.json();
            setLikedReelIds(prevSet => {
                const newSet = new Set(prevSet);
                if (isCurrentlyLiked) {
                    newSet.delete(reelId);
                } else {
                    newSet.add(reelId);
                }
                return newSet;
            });
            setVideos(prevVideos =>
                prevVideos.map(video =>
                    video.id === reelId
                        ? { ...video, likeCount: updatedReel.likeCount }
                        : video
                )
            );
        } catch (error) {
            console.error("Error toggling like:", error);
        }finally {
            setIsTogglingLike(false);
        }
    };
    return (
        <div className="w-screen h-screen bg-black text-white relative overflow-hidden">
            <main className="w-full h-full">
                <VideoPlayer
                    videos={videos}
                    volume={volume}
                    setVolume={setVolume}
                    currentVideoIndex={currentVideoIndex}
                    setCurrentVideoIndex={setCurrentVideoIndex}
                    setIsCommentsOpen={setIsCommentsOpen}
                    appUser={appUser}
                    likedReelIds={likedReelIds}
                    onLikeToggle={handleLikeToggle}
                    isTogglingLike={isTogglingLike}
                />
            </main>

            <div className="absolute top-4 left-4 z-30"><button onClick={() => setIsNavOpen(true)} className="p-2 bg-black/30 rounded-full hover:bg-black/50"><MenuIcon /></button></div>
            <div className="absolute top-4 right-4 z-30"><button onClick={() => setIsAsideOpen(true)} className="p-2 bg-black/30 rounded-full hover:bg-black/50"><TagIcon /></button></div>

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
                    <p className="text-sm font-bold truncate">{user.email}</p>
                    <button onClick={async () => await signOut(auth)} className="w-full mt-4 text-left text-sm text-gray-400 hover:text-white">Logout</button>
                </div>
            </nav>

            <aside className={`absolute top-0 right-0 h-full w-72 bg-black/80 backdrop-blur-md border-l border-gray-800 p-6 transition-transform duration-300 z-40 ${isAsideOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <h2 className="text-lg font-semibold mb-4">Suggested Tags</h2>
                <div className="flex flex-wrap gap-2"><Tag name="#rock" /> <Tag name="#chill" /> <Tag name="#newmusic" /></div>
                <div className="absolute bottom-6 right-6"><button onClick={() => setIsModalOpen(true)} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors"><PlusIcon /></button></div>
            </aside>

            {(isNavOpen || isAsideOpen) && (<div className="absolute inset-0 bg-black/30 z-20" onClick={() => { setIsNavOpen(false); setIsAsideOpen(false); }} />)}
            {isModalOpen && <AddReelModal user={appUser} onClose={() => setIsModalOpen(false)} onReelAdded={fetchVideos} />}
            <CommentsPanel
                isOpen={isCommentsOpen}
                onClose={() => setIsCommentsOpen(false)}
                reel={videos[currentVideoIndex]}
                currentUser={appUser}
                onCommentChange={fetchVideos}
            />
        </div>
    );
}

const NavItem = ({ icon, label, to = "#" }) => ( <li><Link to={to} className="flex items-center space-x-3 text-gray-400 hover:text-white">{icon}<span className="font-semibold">{label}</span></Link></li> );
const Tag = ({ name }) => ( <span className="bg-gray-800 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:bg-gray-700">{name}</span> );

function AddReelModal({ user, onClose, onReelAdded }) {
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [formData, setFormData] = useState({ description: '', author: '', songTitle: '', genre: '', tags: '' });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) { setError('Please select a video file.'); return; }
        setUploading(true);
        setError('');

        try {
            const videoFileName = `${Date.now()}_${videoFile.name}`;
            const videoUrlResponse = await fetch(`http://localhost:8080/api/reels/generate-upload-url?fileName=${encodeURIComponent(videoFileName)}&contentType=${encodeURIComponent(videoFile.type)}`);
            if (!videoUrlResponse.ok) throw new Error('Could not get video upload URL.');
            const presignedVideoUrl = await videoUrlResponse.text();

            const uploadVideoRes = await fetch(presignedVideoUrl, { method: 'PUT', body: videoFile, headers: { 'Content-Type': videoFile.type } });
            if (!uploadVideoRes.ok) throw new Error('Video upload to R2 failed.');


            const formDataToSend = new FormData();
            formDataToSend.append('videoFileName', videoFileName);
            if (thumbnailFile) {
                formDataToSend.append('thumbnailFile', thumbnailFile);
            }
            formDataToSend.append('username', user.username);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('author', formData.author);
            formDataToSend.append('songTitle', formData.songTitle);
            formDataToSend.append('genre', formData.genre);
            formDataToSend.append('tags', formData.tags);

            const saveResponse = await fetch('http://localhost:8080/api/reels', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!saveResponse.ok) {
                const errorText = await saveResponse.text();
                throw new Error(`Failed to save reel: ${errorText}`);
            }

            onReelAdded();
            onClose();
        } catch (err) {
            setError(err.message);
            console.error("Błąd podczas dodawania rolki:", err);
        } finally {
            setUploading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6">Add New Reel</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput label="Song Title" name="songTitle" value={formData.songTitle} onChange={handleInputChange} required />
                    <FormInput label="Author" name="author" value={formData.author} onChange={handleInputChange} required />
                    <FormInput label="Genre" name="genre" value={formData.genre} onChange={handleInputChange} />
                    <FormInput label="Tags (comma separated)" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g. rock, chill, 80s" />
                    <div><label className="block text-sm font-medium text-gray-400">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3" className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500" /></div>
                    <FileInput label="Video File" accept="video/*" onFileChange={setVideoFile} required />
                    <FileInput label="Thumbnail (optional)" accept="image/*" onFileChange={setThumbnailFile} />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end pt-4"><button type="button" onClick={onClose} disabled={uploading} className="mr-4 py-2 px-4 text-sm font-medium text-gray-400 hover:text-white">Cancel</button><button type="submit" disabled={uploading} className="py-2 px-6 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-500">{uploading ? 'Uploading...' : 'Publish'}</button></div>
                </form>
            </div>
        </div>
    );
}
const FormInput = ({ label, name, value, onChange, placeholder, required = false }) => ( <div><label className="block text-sm font-medium text-gray-400">{label}</label><input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500" /></div> );
const FileInput = ({ label, accept, onFileChange, required = false }) => ( <div><label className="block text-sm font-medium text-gray-400 mb-2">{label}</label><input type="file" accept={accept} onChange={(e) => onFileChange(e.target.files[0])} required={required} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"/></div> );

const VideoPlayer = ({ videos, volume, setVolume, setIsCommentsOpen, appUser, likedReelIds, onLikeToggle, isTogglingLike, currentVideoIndex, setCurrentVideoIndex }) => {
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
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleVideoEnd);
        video.volume = volume;
        video.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleVideoEnd);
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
            <video ref={videoRef} key={currentVideo.id} className="w-full h-full object-cover" src={currentVideo.videoUrl}  />

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

const InteractionButton = ({ icon, count, onClick, disabled = false }) => ( // Dodano disabled
    <div className="flex flex-col items-center" onClick={!disabled ? onClick : null}>
        <button
            className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center text-white disabled:opacity-50"
            disabled={disabled}>
            {icon}
        </button>
        <span className="text-xs font-semibold mt-1">{count}</span>
    </div>
);
const CommentsPanel = ({ isOpen, onClose, reel, currentUser, onCommentChange }) => {
    const [newCommentText, setNewCommentText] = useState("");
    const [likedCommentIds, setLikedCommentIds] = useState(new Set());
    const [togglingCommentLikes, setTogglingCommentLikes] = useState(new Set());
    const [replyingTo, setReplyingTo] = useState(null);
    const textInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && currentUser?.username) {
            const fetchLikedComments = async () => {
                try {
                    const response = await fetch(`http://localhost:8080/api/comments/liked/${currentUser.username}`);
                    if (!response.ok) throw new Error('Failed to fetch liked comments');
                    const ids = await response.json();
                    setLikedCommentIds(new Set(ids));
                } catch (error) {
                    console.error("Error fetching liked comments:", error);
                }
            };
            fetchLikedComments();
        }
    }, [isOpen, currentUser]);

    const handleCommentLikeToggle = async (commentId, isCurrentlyLiked) => {
        if (togglingCommentLikes.has(commentId)) return;
        if (!currentUser?.username) return;

        setTogglingCommentLikes(prev => new Set(prev).add(commentId));

        const method = isCurrentlyLiked ? 'DELETE' : 'POST';
        const url = `http://localhost:8080/api/comments/${commentId}/like?username=${currentUser.username}`;

        try {
            const response = await fetch(url, { method });
            if (!response.ok) throw new Error('Failed to update comment like');

            setLikedCommentIds(prev => {
                const newSet = new Set(prev);
                if (isCurrentlyLiked) {
                    newSet.delete(commentId);
                } else {
                    newSet.add(commentId);
                }
                return newSet;
            });
            onCommentChange();

        } catch (error) {
            console.error("Error toggling comment like:", error);
        } finally {
            setTogglingCommentLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
            });
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !reel) return;

        const params = new URLSearchParams({
            text: newCommentText,
            reelId: reel.id,
            username: currentUser.username
        });

        if (replyingTo) {
            params.append('parentCommentId', replyingTo.id);
        }
        try {
            const response = await fetch(`http://localhost:8080/api/comments?${params.toString()}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to add comment');

            onCommentChange();
            setNewCommentText("");
            setReplyingTo(null);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleUpdateComment = async (commentId, text) => {
        const params = new URLSearchParams({ username: currentUser.username });
        try {
            const response = await fetch(`http://localhost:8080/api/comments/${commentId}?${params.toString()}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });
            if (!response.ok) throw new Error('Failed to update comment');
            onCommentChange();
        } catch (error) { console.error("Error updating comment:", error); }
    };

    const handleDeleteComment = async (commentId) => {
        const params = new URLSearchParams({ username: currentUser.username });
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await fetch(`http://localhost:8080/api/comments/${commentId}?${params.toString()}`, { method: 'DELETE' });
                onCommentChange();
            } catch (error) { console.error("Error deleting comment:", error); }
        }
    };

    const handlePinComment = async (commentId) => {
        const params = new URLSearchParams({ username: currentUser.username });
        try {
            await fetch(`http://localhost:8080/api/comments/${commentId}/pin?${params.toString()}`, { method: 'POST' });
            onCommentChange();
        } catch (error) { console.error("Error pinning comment:", error); }
    };

    const handleSetReplyTo = (comment) => {
        setReplyingTo(comment);
        textInputRef.current?.focus();
    };

    return (
        <div className={`absolute top-0 right-0 h-full w-96 bg-black/80 backdrop-blur-md border-l border-gray-800 flex flex-col transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="font-bold text-lg">Comments ({reel?.comments?.length || 0})</h2>
                <button onClick={onClose} className="text-2xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {reel?.comments?.slice().sort((a, b) => b.isPinned - a.isPinned).map(comment => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUser={currentUser}
                        reelOwnerUsername={reel.username}
                        onUpdate={handleUpdateComment}
                        onDelete={handleDeleteComment}
                        onPin={handlePinComment}
                        likedCommentIds={likedCommentIds}
                        togglingCommentLikes={togglingCommentLikes}
                        onLikeToggle={handleCommentLikeToggle}
                        onSetReplyTo={handleSetReplyTo}
                    />
                ))}
            </div>

            <form onSubmit={handleAddComment} className="p-4 border-t border-gray-700">
                {replyingTo && (
                    <div className="text-xs text-gray-400 mb-2">
                        Replying to @{replyingTo.user.username}
                        <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="ml-2 text-blue-400 hover:text-blue-300 font-bold"
                        >
                            [Cancel]
                        </button>
                    </div>
                )}
                <input
                    ref={textInputRef}
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
                    className="w-full bg-gray-800 ... "
                />
            </form>
        </div>
    );
};
const CommentItem = ({ comment, currentUser, reelOwnerUsername, onUpdate, onDelete, onPin,likedCommentIds, togglingCommentLikes, onLikeToggle, onSetReplyTo }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isLiked = likedCommentIds.has(comment.id);
    const isLikeDisabled = togglingCommentLikes.has(comment.id);
    const isOwner = currentUser?.username === comment.user.username;
    const isReelOwner = currentUser?.username === reelOwnerUsername;
    const isEdited = new Date(comment.createdAt) < new Date(comment.lastModifiedAt)

    const handleUpdate = (e) => {
        e.preventDefault();
        onUpdate(comment.id, editText);
        setIsEditing(false);
    };

    return (
        <div className="flex items-start gap-3">
            <img src={comment.user.profilePictureUrl || `https://ui-avatars.com/api/?name=${comment.user.username}&background=333&color=fff&size=40`} alt="avatar" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>@{comment.user.username}</span>
                    {isEdited && <span>(edytowany)</span>}
                </div>
                {!isEditing ? (
                    <p className="text-sm text-white">{comment.text}</p>
                ) : (
                    <form onSubmit={handleUpdate} className="mt-1">
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-md text-sm" />
                        <div className="flex gap-2 mt-1">
                            <button type="submit" className="text-xs bg-white text-black px-2 py-1 rounded">Save</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-gray-400">Cancel</button>
                        </div>
                    </form>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 relative">
                    <button
                        onClick={() => onLikeToggle(comment.id, isLiked)}
                        disabled={isLikeDisabled}
                        className={`flex items-center gap-1 ${isLikeDisabled ? 'cursor-wait' : ''} ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-white'}`}
                    >
                        <SmallHeartIcon isLiked={isLiked} disabled={isLikeDisabled} />
                        <span className={isLiked ? 'text-red-500' : 'text-gray-500'}>{comment.likeCount}</span>
                    </button>

                    <button
                        onClick={() => onSetReplyTo(comment)}
                        className="hover:text-white"
                    >
                        Reply
                    </button>
                    {(isOwner || isReelOwner) && (
                        <button onClick={() => setIsMenuOpen(prev => !prev)} className="font-bold">...</button>
                    )}
                    {isMenuOpen && (
                        <div className="absolute top-5 right-0 bg-gray-800 rounded-md shadow-lg p-2 text-white text-sm z-10 w-28">
                            {isOwner && <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="block w-full text-left p-1 hover:bg-gray-700">Edit</button>}
                            {isOwner && <button onClick={() => { onDelete(comment.id); setIsMenuOpen(false); }} className="block w-full text-left p-1 hover:bg-gray-700">Delete</button>}
                            {isReelOwner && <button onClick={() => { onPin(comment.id); setIsMenuOpen(false); }} className="block w-full text-left p-1 hover:bg-gray-700">{comment.isPinned ? 'Unpin' : 'Pin'}</button>}
                        </div>
                    )}
                </div>
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-700 space-y-4">
                        {comment.replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                currentUser={currentUser}
                                reelOwnerUsername={reelOwnerUsername}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                onPin={onPin}
                                likedCommentIds={likedCommentIds}
                                togglingCommentLikes={togglingCommentLikes}
                                onLikeToggle={onLikeToggle}
                                onSetReplyTo={onSetReplyTo}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
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
                        {video.tags.split(',').map(tag => tag.trim()).map((tag, index) => (
                            <span key={index} className="bg-gray-700 text-gray-200 text-xs px-2 py-0.5 rounded-full">#{tag}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
);

const DetailRow = ({ label, value }) => ( <div><p className="font-bold text-gray-400">{label}</p><p className="text-white">{value}</p></div> );

