import React, { useState, useEffect } from 'react';
import NavigationPanel from '../components/NavigationPanel.jsx';
import AddReelModal from '../components/AddReelModal.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';
import CommentsPanel from '../components/CommentsPanel.jsx';
import AddToPlaylistModal from '../components/AddToPlaylistModal.jsx';
import { apiClient } from '../api/apiClient';

const MenuIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> );

export default function MainPage({
                                     user,
                                     auth,
                                     appUser,
                                     unreadCount,
                                     notifications,
                                     handleMarkAllAsRead,
                                     handleMarkOneAsRead,
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
    const [activeFeed, setActiveFeed] = useState('FOR_YOU');

    const fetchVideos = async (resetIndex = true) => {
        try {
            let url = `/reels/feed?type=${activeFeed}`;

            if (appUser?.username) {
                url += `&username=${appUser.username}`;
            }

            const response = await apiClient(url);

            if (!response.ok) {
                if (response.status === 401 && activeFeed === 'FOLLOWING') {
                    alert("Musisz być zalogowany i mieć profil, aby widzieć obserwowanych.");
                    setActiveFeed('FOR_YOU');
                    return;
                }
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setVideos(data);
            if (resetIndex) {
                setCurrentVideoIndex(0);
            }
        } catch (error) {
            console.error("Błąd podczas pobierania filmów:", error);
            setVideos([]);
        }
    };

    useEffect(() => {
        fetchVideos(true);
        if (appUser?.username) {
            fetchLikedReels(appUser.username);
        }
    }, [appUser, activeFeed]);

    const handleFeedChange = (feedType) => {
        setActiveFeed(feedType);
        setIsNavOpen(false);
    };
    const fetchLikedReels = async (username) => {
        if (!username) return;
        try {
            const response = await apiClient(`/reels/liked/${username}`);
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

    const handleLikeToggle = async (reelId, isCurrentlyLiked) => {
        if (!appUser?.username || isTogglingLike) return;
        setIsTogglingLike(true);

        const username = appUser.username;
        const method = isCurrentlyLiked ? 'DELETE' : 'POST';
        const url = `/reels/${reelId}/like?username=${username}`;

        try {
            const response = await apiClient(url, { method });
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

    return (
        <div className="w-screen h-screen bg-black text-white relative overflow-hidden">
            <main className="w-full h-full">
                <VideoPlayer
                    videos={videos}
                    volume={volume}
                    setVolume={setVolume}
                    currentVideoIndex={currentVideoIndex}
                    setCurrentVideoIndex={setCurrentVideoIndex}
                    setIsCommentsOpen={setIsCommentsOpen}
                    appUser={appUser}
                    isCommentsOpen={isCommentsOpen}
                    likedReelIds={likedReelIds}
                    onLikeToggle={handleLikeToggle}
                    isTogglingLike={isTogglingLike}
                    onOpenPlaylistModal={handleOpenPlaylistModal}
                />
            </main>

            <div className="absolute top-4 left-4 z-30"><button onClick={() => setIsNavOpen(true)} className="p-2 bg-black/30 rounded-full hover:bg-black/50"><MenuIcon /></button></div>

            <NavigationPanel
                user={user}
                auth={auth}
                appUser={appUser}
                isOpen={isNavOpen}
                unreadCount={unreadCount}
                notifications={notifications}
                handleMarkAllAsRead={handleMarkAllAsRead}
                handleMarkOneAsRead={handleMarkOneAsRead}
                totalUnreadChats={totalUnreadChats}
                setIsChatModalOpen={setIsChatModalOpen}
                activeFeed={activeFeed}
                setActiveFeed={handleFeedChange}
            />

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
