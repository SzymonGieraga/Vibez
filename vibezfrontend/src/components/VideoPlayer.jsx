import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/apiClient';

const MuteIcon = () => ( <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l4-4m0 4l-4-4" /></svg> );
const UnmuteIcon = () => ( <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-1.464a5 5 0 010-7.072" /></svg> );
const PlayIcon = () => ( <svg className="w-20 h-20 text-white opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> );
const HeartIcon = ({ isLiked }) => ( <svg className={`w-8 h-8 ${isLiked ? 'text-red-500' : ''}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg> );
const CommentIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const BookmarkIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const ShareIcon = () => (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4M17 9l-5 5-5-5M12 12.8V2.5" /></svg>);
const EyeIcon = () => ( <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> );
const AddIcon = () => ( <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg> );

export default function VideoPlayer({
                                        videos,
                                        volume,
                                        setVolume,
                                        setIsCommentsOpen,
                                        isCommentsOpen,
                                        appUser,
                                        likedReelIds,
                                        onLikeToggle,
                                        isTogglingLike,
                                        currentVideoIndex,
                                        setCurrentVideoIndex,
                                        onOpenPlaylistModal,
                                        onShare,
                                        onAddReel
                                    }) {
    const { t } = useTranslation();
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [touchStart, setTouchStart] = useState(0);

    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const viewCountedRef = useRef(false);

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

    useEffect(() => {
        viewCountedRef.current = false;

        const videoId = videos[currentVideoIndex]?.id;
        if (!videoId) return;

        const timer = setTimeout(() => {
            if (!viewCountedRef.current) {
                apiClient(`/reels/${videoId}/view`, { method: 'POST' })
                    .catch(err => console.error("Failed to count view", err));
                viewCountedRef.current = true;
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [currentVideoIndex, videos]);


    useEffect(() => { if(videoRef.current) videoRef.current.volume = volume; }, [volume]);

    if (!videos || videos.length === 0) {
        return <div className="text-gray-500 flex items-center justify-center h-full">{t('loadingVideos')}</div>;
    }

    const currentVideo = videos[currentVideoIndex];
    if (!currentVideo) {
        return <div className="text-gray-500 flex items-center justify-center h-full">{t('noVideo')}</div>;
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

        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
                goToNextVideo();
            } else {
                goToPrevVideo();
            }
        }
    };

    return (
        <div className="w-full h-full bg-black flex flex-col relative group" onClick={togglePlay} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <video
                ref={videoRef}
                key={currentVideo.id}
                className="w-full h-full object-cover"
                src={currentVideo.videoUrl}
                muted={volume === 0}
                playsInline
                loop={isCommentsOpen}
            />

            <button onClick={(e) => { e.stopPropagation(); goToPrevVideo(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto hidden md:block">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); goToNextVideo(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto hidden md:block">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-between p-4 pointer-events-none">
                <div></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{!isPlaying && <PlayIcon />}</div>
                <div className="text-white pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="cursor-pointer mb-8 md:mb-0" onClick={() => setIsDetailsVisible(true)}>
                        <p className="font-bold text-sm">@{currentVideo.username}</p>
                        <p className="text-xs text-gray-300">{currentVideo.songTitle} {t('by')} {currentVideo.author}</p>
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-[80%]">{currentVideo.description}</p>
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
                        <InteractionButton
                            icon={<ShareIcon />}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onShare) onShare(currentVideo);
                            }}
                        />
                        <InteractionButton
                            icon={<AddIcon />}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onAddReel) onAddReel();
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
            className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:bg-black/60 transition-colors"
            disabled={disabled}>
            {icon}
        </button>
        {count !== undefined && <span className="text-xs font-semibold mt-1">{count}</span>}
    </div>
);

const ExpandedDetailsPanel = ({ video, isVisible, onClose }) => {
    const { t } = useTranslation();
    return (
        <div className={`absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-sm p-4 rounded-t-2xl transition-transform duration-300 ease-in-out z-20 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose}></div>
            <div className="text-left text-sm space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <EyeIcon />
                    <span className="text-gray-300 text-xs">{video.viewCount || 0} {t('views')}</span>
                </div>
                <DetailRow label={t('song')} value={`${video.songTitle} ${t('by')} ${video.author}`} />
                <DetailRow label={t('genre')} value={video.genre} />
                <DetailRow label={t('postedBy')} value={`@${video.username}`} />
                <div><p className="font-bold text-gray-400">{t('description')}</p><p className="text-white whitespace-pre-wrap">{video.description}</p></div>
                {video.tags && (
                    <div>
                        <p className="font-bold text-gray-400">{t('tags')}</p>
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
};

const DetailRow = ({ label, value }) => ( <div><p className="font-bold text-gray-400">{label}</p><p className="text-white">{value}</p></div> );