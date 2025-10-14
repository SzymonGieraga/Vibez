import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import {Link} from 'react-router-dom'

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

export default function MainPage({ user, auth }) {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isAsideOpen, setIsAsideOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [videos, setVideos] = useState([]);
    const [volume, setVolume] = useState(0);

    const fetchVideos = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/reels');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setVideos(data);
        } catch (error) { console.error("Błąd podczas pobierania filmów:", error); }
    };

    useEffect(() => { fetchVideos(); }, []);

    const username = user.email.split('@')[0];

    return (
        <div className="w-screen h-screen bg-black text-white relative overflow-hidden">
            <main className="w-full h-full">
                <VideoPlayer videos={videos} volume={volume} setVolume={setVolume} />
            </main>

            <div className="absolute top-4 left-4 z-30">
                <button onClick={() => setIsNavOpen(true)} className="p-2 bg-black/30 rounded-full hover:bg-black/50">
                    <MenuIcon />
                </button>
            </div>
            <div className="absolute top-4 right-4 z-30">
                <button onClick={() => setIsAsideOpen(true)} className="p-2 bg-black/30 rounded-full hover:bg-black/50">
                    <TagIcon />
                </button>
            </div>

            <nav className={`absolute top-0 left-0 h-full w-72 bg-black/80 backdrop-blur-md border-r border-gray-800 p-6 flex flex-col justify-between transition-transform duration-300 z-40 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <h1 className="text-2xl font-bold mb-10">Vibez</h1>
                    <ul className="space-y-4">
                        <NavItem icon={<HomeIcon />} label="Main Page" />
                        <NavItem icon={<ProfileIcon />} label="Your Profile" to={`/profile/${username}`} />
                        <NavItem icon={<PopularIcon />} label="Popular" />
                        <NavItem icon={<SettingsIcon />} label="Settings" />
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
                <div className="flex flex-wrap gap-2">
                    <Tag name="#rock" /> <Tag name="#chill" /> <Tag name="#newmusic" />
                </div>
                <div className="absolute bottom-6 right-6">
                    <button onClick={() => setIsModalOpen(true)} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors">
                        <PlusIcon />
                    </button>
                </div>
            </aside>

            {(isNavOpen || isAsideOpen) && (
                <div
                    className="absolute inset-0 bg-black/30 z-20"
                    onClick={() => {
                        setIsNavOpen(false);
                        setIsAsideOpen(false);
                    }}
                />
            )}

            {isModalOpen && <AddReelModal user={user} onClose={() => setIsModalOpen(false)} onReelAdded={fetchVideos} />}
        </div>
    );
}

const NavItem = ({ icon, label }) => ( <li className="flex items-center space-x-3 text-gray-400 hover:text-white cursor-pointer">{icon}<span className="font-semibold">{label}</span></li> );
const Tag = ({ name }) => ( <span className="bg-gray-800 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:bg-gray-700">{name}</span> );

function AddReelModal({ user, onClose, onReelAdded }) {
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [formData, setFormData] = useState({
        description: '', author: '', songTitle: '', genre: '', tags: ''
    });
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

            let thumbnailFileName = null;
            let presignedThumbnailUrl = null;
            if (thumbnailFile) {
                thumbnailFileName = `${Date.now()}_${thumbnailFile.name}`;
                const thumbUrlResponse = await fetch(`http://localhost:8080/api/reels/generate-upload-url?fileName=${encodeURIComponent(thumbnailFileName)}&contentType=${encodeURIComponent(thumbnailFile.type)}`);
                if (!thumbUrlResponse.ok) throw new Error('Could not get thumbnail upload URL.');
                presignedThumbnailUrl = await thumbUrlResponse.text();
            }

            const uploadPromises = [ fetch(presignedVideoUrl, { method: 'PUT', body: videoFile, headers: { 'Content-Type': videoFile.type } }) ];
            if (presignedThumbnailUrl) {
                uploadPromises.push( fetch(presignedThumbnailUrl, { method: 'PUT', body: thumbnailFile, headers: { 'Content-Type': thumbnailFile.type } }) );
            }
            const uploadResults = await Promise.all(uploadPromises);
            if (uploadResults.some(res => !res.ok)) throw new Error('File upload to R2 failed.');

            const saveResponse = await fetch('http://localhost:8080/api/reels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, videoFileName: videoFileName, thumbnailFileName: thumbnailFileName, username: user.email, })
            });
            if (!saveResponse.ok) throw new Error('Failed to save reel metadata.');

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
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3" className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500" />
                    </div>
                    <FileInput label="Video File" accept="video/*" onFileChange={setVideoFile} required />
                    <FileInput label="Thumbnail (optional)" accept="image/*" onFileChange={setThumbnailFile} />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} disabled={uploading} className="mr-4 py-2 px-4 text-sm font-medium text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" disabled={uploading} className="py-2 px-6 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-500">
                            {uploading ? 'Uploading...' : 'Publish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const FormInput = ({ label, name, value, onChange, placeholder, required = false }) => ( <div><label className="block text-sm font-medium text-gray-400">{label}</label><input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500" /></div> );
const FileInput = ({ label, accept, onFileChange, required = false }) => ( <div><label className="block text-sm font-medium text-gray-400 mb-2">{label}</label><input type="file" accept={accept} onChange={(e) => onFileChange(e.target.files[0])} required={required} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"/></div> );

const VideoPlayer = ({ videos, volume, setVolume }) => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
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

    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientY);
    };

    const handleTouchEnd = (e) => {
        const touchEnd = e.changedTouches[0].clientY;
        const deltaY = touchStart - touchEnd;
        if (deltaY > 50) { // Swipe up
            setIsDetailsVisible(true);
        } else if (deltaY < -50) { // Swipe down
            setIsDetailsVisible(false);
        }
    };

    return (
        <div
            className="w-full h-full bg-black flex flex-col relative group"
            onClick={togglePlay}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <video ref={videoRef} key={currentVideo.id} className="w-full h-full object-cover" src={currentVideo.videoUrl} poster={currentVideo.thumbnailUrl} />

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

            <ExpandedDetailsPanel
                video={currentVideo}
                isVisible={isDetailsVisible}
                onClose={() => setIsDetailsVisible(false)}
            />
        </div>
    );
};

const ExpandedDetailsPanel = ({ video, isVisible, onClose }) => {
    return (
        <div
            className={`absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-sm p-4 rounded-t-2xl transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-4" onClick={onClose}></div>
            <div className="text-left text-sm space-y-2">
                <DetailRow label="Song" value={`${video.songTitle} by ${video.author}`} />
                <DetailRow label="Genre" value={video.genre} />
                <DetailRow label="Posted by" value={`@${video.username}`} />
                <div>
                    <p className="font-bold text-gray-400">Description</p>
                    <p className="text-white whitespace-pre-wrap">{video.description}</p>
                </div>
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
};

const DetailRow = ({ label, value }) => (
    <div>
        <p className="font-bold text-gray-400">{label}</p>
        <p className="text-white">{value}</p>
    </div>
);

