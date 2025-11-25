import React, { useState, useRef, useEffect } from 'react';
import {apiClient} from "../api/apiClient.js";

const FormInput = ({ label, name, value, onChange, placeholder, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
    </div>
);

const FileInput = ({ label, accept, onFileChange, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <input
            type="file"
            accept={accept}
            onChange={(e) => onFileChange(e.target.files[0])}
            required={required}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
        />
    </div>
);

const VideoPreviewSelector = ({ videoFile, onFramesSelect, onThumbnailSelect, thumbnailSource }) => {
    const [selectedFrames, setSelectedFrames] = useState([]);
    const [selectedThumbnail, setSelectedThumbnail] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (videoFile) {
            const url = URL.createObjectURL(videoFile);
            setVideoUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [videoFile]);

    useEffect(() => {
        if (videoRef.current) {
            const video = videoRef.current;

            const handleLoadedMetadata = () => {
                setDuration(video.duration);
            };

            const handleTimeUpdate = () => {
                setCurrentTime(video.currentTime);
            };

            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                video.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [videoUrl]);

    useEffect(() => {
        onFramesSelect(selectedFrames);
    }, [selectedFrames]);

    useEffect(() => {
        if (thumbnailSource === 'upload') {
            setSelectedThumbnail(null);
        }
    }, [thumbnailSource]);

    const captureCurrentFrame = async () => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const file = new File([blob], `frame_${Date.now()}.jpg`, { type: 'image/jpeg' });
                resolve({
                    file,
                    timestamp: video.currentTime,
                    previewUrl: URL.createObjectURL(blob)
                });
            }, 'image/jpeg', 0.85);
        });
    };

    const handleAddFrame = async () => {
        if (selectedFrames.length >= 6) {
            alert('You can select maximum 6 frames');
            return;
        }

        const frame = await captureCurrentFrame();
        if (frame) {
            setSelectedFrames(prev => [...prev, frame]);
        }
    };

    const handleSetThumbnail = async () => {
        const frame = await captureCurrentFrame();
        if (frame) {
            setSelectedThumbnail(frame);
            onThumbnailSelect(frame.file);
        }
    };

    const removeFrame = (index) => {
        setSelectedFrames(prev => {
            const updated = prev.filter((_, i) => i !== index);
            return updated;
        });
    };

    const clearThumbnail = () => {
        setSelectedThumbnail(null);
        onThumbnailSelect(null);
    };

    const seekTo = (time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!videoFile) return null;

    return (
        <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-300">
                {thumbnailSource === 'video'
                    ? 'Select Preview Frames & Thumbnail'
                    : 'Select Preview Frames'
                }
            </label>
            <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full max-h-64 object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {!isPlaying && (
                        <div className="bg-black/50 rounded-full p-4">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onChange={(e) => seekTo(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={togglePlayPause}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        {isPlaying ? (
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Pause
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Play
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleAddFrame}
                        disabled={selectedFrames.length >= 6}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        📸 Add Preview Frame ({selectedFrames.length}/6)
                    </button>

                    {thumbnailSource === 'video' && (
                        <button
                            type="button"
                            onClick={handleSetThumbnail}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            🖼️ Set as Thumbnail
                        </button>
                    )}
                </div>
            </div>

            {thumbnailSource === 'video' && selectedThumbnail && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Selected Thumbnail from Video:</label>
                    <div className="relative inline-block">
                        <img
                            src={selectedThumbnail.previewUrl}
                            alt="Thumbnail"
                            className="h-24 rounded-lg border-2 border-purple-500"
                        />
                        <button
                            type="button"
                            onClick={clearThumbnail}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                            ×
                        </button>
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatTime(selectedThumbnail.timestamp)}
                        </div>
                    </div>
                </div>
            )}

            {selectedFrames.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Selected Preview Frames ({selectedFrames.length}/6):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {selectedFrames.map((frame, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={frame.previewUrl}
                                    alt={`Frame ${index + 1}`}
                                    className="w-full h-auto rounded-lg border border-gray-600"
                                />
                                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {formatTime(frame.timestamp)}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFrame(index)}
                                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-xs text-gray-400">
                💡 Tip: Pause the video at desired moments and click "Add Preview Frame" to capture them.
                These frames will be shown when users hover over your reel.
            </p>
        </div>
    );
};

export default function AddReelModal({ user, onClose, onReelAdded }) {
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailSource, setThumbnailSource] = useState('upload'); // 'upload' or 'video'
    const [previewFrames, setPreviewFrames] = useState([]);
    const [formData, setFormData] = useState({
        description: '',
        author: '',
        songTitle: '',
        genre: '',
        tags: ''
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVideoChange = (file) => {
        setVideoFile(file);
        if (thumbnailSource === 'video') {
            setThumbnailFile(null);
        }
        setPreviewFrames([]);
    };

    const handleThumbnailSourceChange = (source) => {
        setThumbnailSource(source);
        setThumbnailFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            setError('Please select a video file.');
            return;
        }

        setUploading(true);
        setError('');
        setUploadProgress('Uploading video and frames...');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('videoFile', videoFile);

            if (thumbnailFile) {
                formDataToSend.append('thumbnailFile', thumbnailFile);
            }

            previewFrames.forEach((frame, index) => {
                formDataToSend.append(`previewFrame${index}`, frame.file);
            });

            formDataToSend.append('username', user.username);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('author', formData.author);
            formDataToSend.append('songTitle', formData.songTitle);
            formDataToSend.append('genre', formData.genre);
            formDataToSend.append('tags', formData.tags);

            const saveResponse = await apiClient('/reels', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!saveResponse.ok) {
                const errorText = await saveResponse.text();
                throw new Error(`Failed to save reel: ${errorText}`);
            }

            setUploadProgress('Reel published successfully!');
            setTimeout(() => {
                onReelAdded();
                onClose();
            }, 1000);
        } catch (err) {
            setError(err.message);
            console.error("Error adding reel:", err);
        } finally {
            setUploading(false);
            setUploadProgress('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <style>{`
                @keyframes pulse-glow {
                    0%, 100% {
                        opacity: 1;
                        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
                    }
                    50% {
                        opacity: 0.7;
                        box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
                    }
                }
                
                @keyframes shimmer {
                    0% {
                        background-position: -200% center;
                    }
                    100% {
                        background-position: 200% center;
                    }
                }
                
                .processing-box {
                    animation: pulse-glow 2s ease-in-out infinite;
                    background: linear-gradient(
                        90deg,
                        rgba(59, 130, 246, 0.1) 0%,
                        rgba(59, 130, 246, 0.2) 50%,
                        rgba(59, 130, 246, 0.1) 100%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 3s ease-in-out infinite, pulse-glow 2s ease-in-out infinite;
                }
                
                @keyframes dots {
                    0%, 20% { content: '.'; }
                    40% { content: '..'; }
                    60%, 100% { content: '...'; }
                }
                
                .loading-dots::after {
                    content: '...';
                    animation: dots 1.5s steps(1) infinite;
                }
            `}</style>

            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6">Add New Reel</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Song Title"
                        name="songTitle"
                        value={formData.songTitle}
                        onChange={handleInputChange}
                        required
                    />
                    <FormInput
                        label="Author"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        required
                    />
                    <FormInput
                        label="Genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleInputChange}
                    />
                    <FormInput
                        label="Tags (comma separated)"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="e.g. rock, chill, 80s"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows="3"
                            className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                    </div>
                    <FileInput
                        label="Video File (will be converted to MP4)"
                        accept="video/*"
                        onFileChange={handleVideoChange}
                        required
                    />

                    <div className="space-y-3 bg-gray-800 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-300">Thumbnail Options</label>

                        <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="upload"
                                    checked={thumbnailSource === 'upload'}
                                    onChange={(e) => handleThumbnailSourceChange(e.target.value)}
                                    className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-300">Upload Custom Thumbnail</span>
                            </label>

                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="video"
                                    checked={thumbnailSource === 'video'}
                                    onChange={(e) => handleThumbnailSourceChange(e.target.value)}
                                    className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                                    disabled={!videoFile}
                                />
                                <span className={`ml-2 text-sm ${!videoFile ? 'text-gray-600' : 'text-gray-300'}`}>
                                    Select from Video
                                </span>
                            </label>
                        </div>

                        {thumbnailSource === 'upload' && (
                            <FileInput
                                label="Upload Thumbnail Image"
                                accept="image/*"
                                onFileChange={setThumbnailFile}
                            />
                        )}
                    </div>

                    {videoFile && (
                        <VideoPreviewSelector
                            videoFile={videoFile}
                            onFramesSelect={setPreviewFrames}
                            onThumbnailSelect={setThumbnailFile}
                            thumbnailSource={thumbnailSource}
                        />
                    )}

                    {uploadProgress && (
                        <div className="processing-box border border-blue-500 text-blue-100 p-4 rounded-lg">
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="font-medium loading-dots">{uploadProgress}</span>
                            </div>
                            <p className="text-xs text-blue-300 text-center mt-3 animate-pulse">
                                ⏳ This may take a few minutes depending on video size
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="mr-4 py-2 px-4 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="py-2 px-6 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
                        >
                            {uploading ? 'Processing...' : 'Publish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}