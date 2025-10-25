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

            await fetch(presignedVideoUrl, { method: 'PUT', body: videoFile, headers: { 'Content-Type': videoFile.type } });

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

