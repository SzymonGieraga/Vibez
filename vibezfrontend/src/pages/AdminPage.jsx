import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';

export default function AdminPage({ user }) {
    const [activeTab, setActiveTab] = useState('reports');
    const [reports, setReports] = useState([]);
    const [reels, setReels] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);

    const [editingReelId, setEditingReelId] = useState(null);
    const [editDescription, setEditDescription] = useState("");
    const [editsongTitle, setEditsongTitle] = useState("");
    const [editAuthor, setEditAuthor] = useState("");
    const [editTags, setEditTags] = useState("");

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports();
        } else if (activeTab === 'reels') {
            fetchReels(0, true);
        }
    }, [activeTab]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await apiClient('/admin/reports', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReels = async (pageNumber, reset = false) => {
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await apiClient(`/admin/reels?page=${pageNumber}&size=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (reset) {
                setReels(data.content);
            } else {
                setReels(prev => [...prev, ...data.content]);
            }
            setPage(pageNumber);
            setHasMore(!data.last);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContent = async (type, id) => {
        try {
            const token = await user.getIdToken();
            const endpoint = type === 'REEL' ? `/admin/reels/${id}` : `/admin/comments/${id}`;
            await apiClient(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (type === 'REEL') {
                setReels(prev => prev.filter(r => r.id !== id));
            } else {
                fetchReports();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateReel = async (id) => {
        try {
            const token = await user.getIdToken();
            const payload = {
                description: editDescription,
                title: editsongTitle,
                artist: editAuthor,
                tags: editTags
            };

            await apiClient(`/admin/reels/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            const updatedTagsArray = editTags
                .split(',')
                .map(t => ({ name: t.trim() }))
                .filter(t => t.name !== "");

            setReels(prev => prev.map(r => r.id === id ? {
                ...r,
                description: editDescription,
                songTitle: editsongTitle,
                author: editAuthor,
                tags: updatedTagsArray
            } : r));
            setEditingReelId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const formatTags = (tags) => {
        if (!tags) return "";
        if (Array.isArray(tags)) {
            return tags.map(t => typeof t === 'object' ? t.name : t).join(', ');
        }
        return tags;
    };

    return (
        <div className="p-6 bg-black text-white min-h-screen">
            <h1 className="text-2xl mb-4">Admin Panel</h1>

            <div className="flex gap-4 mb-6 border-b border-gray-700 pb-2">
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-2 ${activeTab === 'reports' ? 'bg-gray-800 rounded' : ''}`}
                >
                    Zgłoszenia
                </button>
                <button
                    onClick={() => setActiveTab('reels')}
                    className={`px-4 py-2 ${activeTab === 'reels' ? 'bg-gray-800 rounded' : ''}`}
                >
                    Rolki
                </button>
            </div>

            {loading && page === 0 && <div>Loading...</div>}

            {activeTab === 'reports' && (
                <div className="flex flex-col gap-4">
                    {reports.map(report => (
                        <div key={report.id} className="p-4 border border-gray-700 rounded bg-gray-900">
                            <p>Typ: {report.type}</p>
                            <p>ID Kontentu: {report.content_id}</p>
                            <p>Powód: {report.reason}</p>
                            <p>Status: {report.status}</p>
                            <button
                                onClick={() => handleDeleteContent(report.type, report.content_id)}
                                className="mt-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                            >
                                Usuń treść
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'reels' && (
                <div className="flex flex-col gap-6">
                    {reels.map(reel => (
                        <div key={reel.id} className="flex border border-gray-700 rounded bg-gray-900 p-4 gap-4">
                            <div className="w-[25vw] h-[20vh] bg-black flex-shrink-0">
                                <video
                                    src={reel.videoUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
                                        <span className="font-bold">ID: {reel.id}</span>
                                        <span className="text-gray-500">|</span>
                                        <Link
                                            to={`/profile/${reel.user?.username}`}
                                            className="text-blue-400 hover:text-blue-300 font-semibold"
                                        >
                                            @{reel.user?.username}
                                        </Link>
                                    </div>

                                    {editingReelId === reel.id ? (
                                        <div className="flex flex-col gap-3 mb-4">
                                            <input
                                                type="text"
                                                value={editsongTitle}
                                                onChange={(e) => setEditsongTitle(e.target.value)}
                                                placeholder="Tytuł rolki"
                                                className="w-full bg-gray-800 text-white p-2 rounded"
                                            />
                                            <input
                                                type="text"
                                                value={editAuthor}
                                                onChange={(e) => setEditAuthor(e.target.value)}
                                                placeholder="Wykonawca"
                                                className="w-full bg-gray-800 text-white p-2 rounded"
                                            />
                                            <input
                                                type="text"
                                                value={editTags}
                                                onChange={(e) => setEditTags(e.target.value)}
                                                placeholder="Tagi (oddzielone przecinkami)"
                                                className="w-full bg-gray-800 text-white p-2 rounded"
                                            />
                                            <textarea
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                placeholder="Opis"
                                                className="w-full bg-gray-800 text-white p-2 rounded"
                                                rows="3"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mb-4 space-y-1">
                                            <p><span className="text-gray-400">Tytuł:</span> {reel.songTitle}</p>
                                            <p><span className="text-gray-400">Wykonawca:</span> {reel.author}</p>
                                            <p><span className="text-gray-400">Tagi:</span> {formatTags(reel.tags)}</p>
                                            <p><span className="text-gray-400">Opis:</span> {reel.description}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {editingReelId === reel.id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateReel(reel.id)}
                                                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                                            >
                                                Zapisz
                                            </button>
                                            <button
                                                onClick={() => setEditingReelId(null)}
                                                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                                            >
                                                Anuluj
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingReelId(reel.id);
                                                setEditDescription(reel.description || "");
                                                setEditsongTitle(reel.songTitle || "");
                                                setEditAuthor(reel.author || "");
                                                setEditTags(formatTags(reel.tags));
                                            }}
                                            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                                        >
                                            Edytuj metadane
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteContent('REEL', reel.id)}
                                        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                                    >
                                        Usuń rolkę
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {hasMore && (
                        <button
                            onClick={() => fetchReels(page + 1)}
                            className="mt-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 w-full"
                            disabled={loading}
                        >
                            {loading ? 'Ładowanie...' : 'Pokaż więcej'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}