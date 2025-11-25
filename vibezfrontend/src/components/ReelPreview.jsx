import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/apiClient';

const EyeIcon = () => (
    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const FireIcon = () => (
    <svg className="w-3 h-3 md:w-4 md:h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
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

    const formatViewCount = (count) => {
        if (!count) return '0';
        if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        return count.toString();
    };

    const isTrending = () => {
        if (!reel.viewCount) return false;

        if (reel.viewCount >= 1000000) return true;

        if (reel.createdAt) {
            const created = new Date(reel.createdAt);
            const now = new Date();
            const hoursDiff = (now - created) / (1000 * 60 * 60);

            if (hoursDiff < 24 && reel.viewCount > 500) return true;
            if (hoursDiff < 72 && reel.viewCount > 2000) return true;
        }

        return false;
    };

    const isHot = isTrending();

    useEffect(() => {
        if (isHovering) {
            setIsLoading(true);

            hoverTimerRef.current = setTimeout(async () => {
                try {
                    const response = await apiClient(`/reels/${reel.id}/preview`);
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
            setIsLoading(false);
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            stopPreview();
        }

        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
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
        if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
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
            className="aspect-w-9 aspect-h-16 bg-gray-900 group relative overflow-hidden cursor-pointer rounded-sm shadow-sm"
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

            {!showPreview && (
                <div className={`absolute bottom-2 left-2 z-10 flex items-center gap-1 text-xs font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] ${isHot ? 'text-orange-400' : 'text-white'}`}>
                    {isHot ? <FireIcon /> : <EyeIcon />}
                    <span>{formatViewCount(reel.viewCount)}</span>
                </div>
            )}

            {showPreview && previewData && previewData.frameUrls && (
                <>
                    <img
                        src={previewData.frameUrls[currentFrame]}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                    />
                    <audio ref={audioRef} src={reel.videoUrl} loop />

                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {currentFrame + 1}/{previewData.frameUrls.length}
                    </div>
                </>
            )}

            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center p-2 transition-opacity duration-300 pointer-events-none ${
                (isHovering && !showPreview) ? 'opacity-100' : 'opacity-0'
            }`}>
                <p className="text-white text-sm font-bold text-center drop-shadow-md">{reel.songTitle}</p>
            </div>

            {(isHovering && !showPreview && isLoading) && (
                <div className="absolute bottom-2 right-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {showPreview && (
                <div className="absolute top-2 right-2 flex gap-1 z-20">
                    {audioBlocked ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); enableAudio(); }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-full p-1.5 transition-colors shadow-sm"
                            title="Unblock Audio"
                        >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
                            className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors shadow-sm"
                            title={audioEnabled ? "Mute" : "Unmute"}
                        >
                            {audioEnabled ? (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReelPreview;