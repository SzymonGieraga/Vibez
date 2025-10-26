import React, { useState } from 'react';

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

export default function AddReelModal({ user, onClose, onReelAdded }) {
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            setError('Please select a video file.');
            return;
        }

        setUploading(true);
        setError('');
        setUploadProgress('Uploading and converting video...');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('videoFile', videoFile);
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
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

            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                        onFileChange={setVideoFile}
                        required
                    />
                    <FileInput
                        label="Thumbnail (optional)"
                        accept="image/*"
                        onFileChange={setThumbnailFile}
                    />

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