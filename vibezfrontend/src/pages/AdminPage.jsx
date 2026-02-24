import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';

export default function AdminPage({ user }) {
    const [activeTab, setActiveTab] = useState('reports');

    const [reports, setReports] = useState([]);
    const [reportPage, setReportPage] = useState(0);
    const [hasMoreReports, setHasMoreReports] = useState(true);

    const [reels, setReels] = useState([]);
    const [reelPage, setReelPage] = useState(0);
    const [hasMoreReels, setHasMoreReels] = useState(true);

    const [loading, setLoading] = useState(true);

    const [editingReelId, setEditingReelId] = useState(null);
    const [editDescription, setEditDescription] = useState("");
    const [editsongTitle, setEditsongTitle] = useState("");
    const [editAuthor, setEditAuthor] = useState("");
    const [editTags, setEditTags] = useState("");

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports(0, true);
        } else if (activeTab === 'reels') {
            fetchReels(0, true);
        }
    }, [activeTab]);

    const fetchReports = async (pageNumber, reset = false) => {
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await apiClient(`/admin/reports?page=${pageNumber}&size=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (reset) {
                setReports(data.content);
            } else {
                setReports(prev => [...prev, ...data.content]);
            }
            setReportPage(pageNumber);
            setHasMoreReports(!data.last);
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
            setReelPage(pageNumber);
            setHasMoreReels(!data.last);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReportAction = async (reportId, action) => {
        try {
            const token = await user.getIdToken();
            await apiClient(`/admin/reports/${reportId}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReports(prev => prev.map(r => r.id === reportId ? {
                ...r,
                status: action === 'accept' ? 'RESOLVED' : 'REJECTED'
            } : r));
        } catch (error) {
            console.error(error);
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

            {loading && ((activeTab === 'reports' && reportPage === 0) || (activeTab === 'reels' && reelPage === 0)) && <div>Loading...</div>}

            {activeTab === 'reports' && (
                <div className="flex flex-col gap-6">
                    {reports.map(report => (
                        <div key={report.id} className="p-4 border border-gray-700 rounded bg-gray-900 flex flex-col gap-2">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
                                <div>
                                    <span className="font-bold text-lg">Zgłoszenie #{report.id}</span>
                                    <span className="ml-2 text-sm text-gray-400">Typ: {report.type} | Zgłosił: @{report.reporterUsername}</span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${report.status === 'PENDING' ? 'bg-yellow-600' : report.status === 'RESOLVED' ? 'bg-green-600' : 'bg-red-600'}`}>
                                    {report.status}
                                </span>
                            </div>

                            <p className="mb-2"><span className="text-gray-400">Powód:</span> {report.reason}</p>

                            <div className="bg-black p-4 rounded border border-gray-800">
                                {report.type === 'REEL' && report.reel && (
                                    <div className="flex gap-4">
                                        <div className="w-[15vw] h-[12vh] bg-gray-900 flex-shrink-0">
                                            <video src={report.reel.videoUrl} controls className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p><strong>Autor:</strong> @{report.reel.user?.username}</p>
                                            <p><strong>Opis:</strong> {report.reel.description}</p>
                                        </div>
                                    </div>
                                )}
                                {report.type === 'REEL' && !report.reel && (
                                    <p className="text-gray-500 italic">Treść została już usunięta.</p>
                                )}

                                {report.type === 'COMMENT' && report.commentText && (
                                    <div>
                                        <p><strong>@{report.commentAuthor}:</strong> {report.commentText}</p>
                                    </div>
                                )}
                                {report.type === 'COMMENT' && !report.commentText && (
                                    <p className="text-gray-500 italic">Komentarz został już usunięty.</p>
                                )}
                                {report.type === 'USER' && report.reportedUser && (
                                    <div className="flex items-center gap-4">
                                        {report.reportedUser.profilePictureUrl ? (
                                            <img
                                                src={report.reportedUser.profilePictureUrl}
                                                alt="avatar"
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold">@{report.reportedUser.username}</p>
                                            <p className="text-sm text-gray-400">{report.reportedUser.bio || 'Brak bio'}</p>
                                        </div>
                                    </div>
                                )}
                                {report.type === 'USER' && !report.reportedUser && (
                                    <p className="text-gray-500 italic">Użytkownik nie istnieje.</p>
                                )}
                            </div>

                            {report.status === 'PENDING' && (
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleReportAction(report.id, 'accept')}
                                        className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 font-bold text-sm"
                                    >
                                        Przyjmij (Usuń / Zbanuj)
                                    </button>
                                    <button
                                        onClick={() => handleReportAction(report.id, 'reject')}
                                        className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 font-bold text-sm"
                                    >
                                        Odrzuć
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {hasMoreReports && (
                        <button
                            onClick={() => fetchReports(reportPage + 1)}
                            className="mt-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 w-full"
                            disabled={loading}
                        >
                            {loading ? 'Ładowanie...' : 'Pokaż więcej zgłoszeń'}
                        </button>
                    )}
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
                    {hasMoreReels && (
                        <button
                            onClick={() => fetchReels(reelPage + 1)}
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