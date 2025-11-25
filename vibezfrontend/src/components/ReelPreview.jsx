import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/apiClient';

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
                    const response = await apiClient(`/reels/${reel.id}/preview`);
                    const preview = await response.json();
                    if (preview.frameUrls && preview.frameUrls.length > 0) {
                        setPreviewData(preview);
                        setShowPreview(true);
                        startFrameAnimation(preview.frameUrls.length);
                        loadAudio();
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

export default ReelPreview;