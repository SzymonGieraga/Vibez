import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavigationPanel from '../components/NavigationPanel.jsx';
import AddReelModal from '../components/AddReelModal.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';
import CommentsPanel from '../components/CommentsPanel.jsx';
import AddToPlaylistModal from '../components/AddToPlaylistModal.jsx';

const PlusIcon = () => ( <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> );
const MenuIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> );
const TagIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2 2V5a2 2 0 012-2zM17 11h.01M17 7h5a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5a2 2 0 012-2zM7 17h.01M7 13h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z" /></svg> );
const NotificationBellIcon = () => (<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>);

export default function MainPage({
                                     user,
                                     auth,
                                     appUser,
                                     unreadCount,
                                     lastNotification,
                                     setLastNotification,
                                     notifications,
                                     setNotifications,
                                     handleMarkAllAsRead,
                                     totalUnreadChats,
                                     setIsChatModalOpen
                                 }) {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isAsideOpen, setIsAsideOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [videos, setVideos] = useState([]);
    const [volume, setVolume] = useState(0);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [likedReelIds, setLikedReelIds] = useState(new Set());
    const [isTogglingLike, setIsTogglingLike] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [selectedReelForPlaylist, setSelectedReelForPlaylist] = useState(null);
    const [toast, setToast] = useState(null);
    const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);

    const fetchVideos = async (resetIndex = true) => {
        try {
            const response = await fetch('http://localhost:8080/api/reels');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setVideos(data);
            if (resetIndex) {
                setCurrentVideoIndex(0);
            }
        } catch (error) {
            console.error("Błąd podczas pobierania filmów:", error);
        }
    };

    const fetchLikedReels = async (username) => {
        if (!username) return;
        try {
            const response = await fetch(`http://localhost:8080/api/reels/liked/${username}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const likedReels = await response.json();
            const idSet = new Set(likedReels.filter(reel => reel != null).map(reel => reel.id));
            setLikedReelIds(idSet);
        } catch (error) {
            console.error("Błąd podczas pobierania polubionych filmów:", error);
        }
    };

    useEffect(() => {
        fetchVideos(true);
        if (appUser?.username) {
            fetchLikedReels(appUser.username);
        }
    }, [appUser]);

    useEffect(() => {
        if (lastNotification && !lastNotification.read) {
            setToast(lastNotification);
            setIsMarkingAsRead(false);
            const timer = setTimeout(() => {
                setToast(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [lastNotification]);

    const handleLikeToggle = async (reelId, isCurrentlyLiked) => {
        if (!appUser?.username || isTogglingLike) return;
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
                if (isCurrentlyLiked) newSet.delete(reelId);
                else newSet.add(reelId);
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
        } finally {
            setIsTogglingLike(false);
        }
    };

    const handleOpenPlaylistModal = (reel) => {
        setSelectedReelForPlaylist(reel);
        setIsPlaylistModalOpen(true);
    };

    const handleClosePlaylistModal = () => {
        setIsPlaylistModalOpen(false);
        setSelectedReelForPlaylist(null);
    };

    const handleMarkToastAsRead = async (notification) => {
        if (!notification || isMarkingAsRead || notification.read) {
            return;
        }
        setIsMarkingAsRead(true);

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.error("Użytkownik nie jest zalogowany!");
                setIsMarkingAsRead(false);
                return;
            }

            const token = await currentUser.getIdToken();

            const response = await fetch(`http://localhost:8080/api/notifications/${notification.id}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                console.log("Oznaczono powiadomienie jako przeczytane:", notification.id);

                if (typeof setNotifications === 'function') {
                    setNotifications(prevNotifications =>
                        prevNotifications.map(n =>
                            n.id === notification.id ? { ...n, read: true } : n
                        )
                    );
                } else {
                    console.warn("MainPage: setNotifications nie zostało przekazane jako prop. Nie można zaktualizować stanu listy.");
                }

                if (typeof setLastNotification === 'function' && lastNotification?.id === notification.id) {
                    setLastNotification(prev => ({ ...prev, read: true }));
                }

            } else {
                console.warn("Nie udało się oznaczyć powiadomienia jako przeczytanego:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Błąd podczas oznaczania powiadomienia jako przeczytanego:", error);
        } finally {
            setIsMarkingAsRead(false);
        }
    };

    const handleToastLinkClick = () => {
        if (toast) {
            handleMarkToastAsRead(toast);
        }
    };

    const handleToastClose = () => {
        if (toast) {
            handleMarkToastAsRead(toast);
        }
        setToast(null);
    };

    return (
        <div className="w-screen h-screen bg-black text-white relative overflow-hidden">

            <ToastNotification
                notification={toast}
                onLinkClick={handleToastLinkClick}
                onClose={handleToastClose}
            />

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
                    onOpenPlaylistModal={handleOpenPlaylistModal}
                />
            </main>

            <div className="absolute top-4 left-4 z-30"><button onClick={() => setIsNavOpen(true)} className="p-2 bg-black/30 rounded-full hover:bg-black/50"><MenuIcon /></button></div>
            <div className="absolute top-4 right-4 z-30"><button onClick={() => setIsAsideOpen(true)} className="p-2 bg-black/30 rounded-full hover:bg-black/50"><TagIcon /></button></div>

            <NavigationPanel
                user={user}
                auth={auth}
                appUser={appUser}
                isOpen={isNavOpen}
                unreadCount={unreadCount}
                notifications={notifications}
                handleMarkAllAsRead={handleMarkAllAsRead}
                handleMarkOneAsRead={handleMarkToastAsRead}
                totalUnreadChats={totalUnreadChats}
                setIsChatModalOpen={setIsChatModalOpen}
            />

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
                onCommentChange={() => fetchVideos(false)}
            />
            {isPlaylistModalOpen && (
                <AddToPlaylistModal
                    reelToAdd={selectedReelForPlaylist}
                    appUser={appUser}
                    onClose={handleClosePlaylistModal}
                />
            )}
        </div>
    );
}

const Tag = ({ name }) => ( <span className="bg-gray-800 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:bg-gray-700">{name}</span> );

const ToastNotification = ({ notification, onLinkClick, onClose }) => {
    if (!notification) return null;

    const handleCloseClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
    };

    const handleLinkClick = () => {
        onLinkClick();
    };

    return (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 w-auto max-w-sm bg-gray-900/80 backdrop-blur-md border-gray-700 text-white p-4 rounded-lg shadow-xl">
            <div className="flex items-start space-x-3">
                <Link
                    to={notification.relativeUrl}
                    className="flex items-start space-x-3 flex-1 min-w-0"
                    onClick={handleLinkClick}
                >
                    {notification.actorProfilePictureUrl ? (
                        <img src={notification.actorProfilePictureUrl} alt={notification.actorUsername} className="w-10 h-10 rounded-full flex-shrink-0" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                            <NotificationBellIcon />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{notification.title || 'Nowe powiadomienie!'}</p>
                        <p className="text-sm text-gray-300">{notification.body}</p>
                    </div>
                </Link>
                <button onClick={handleCloseClick} className="text-gray-500 hover:text-white flex-shrink-0 z-10">&times;</button>
            </div>
        </div>
    );
};