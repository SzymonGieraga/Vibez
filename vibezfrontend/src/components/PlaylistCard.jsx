import React from 'react';

const PlaylistCard = ({ playlist, onClick }) => {
    const hasReels = Array.isArray(playlist.playlistReels) && playlist.playlistReels.length > 0;

    const thumbnailUrl = hasReels
        ? playlist.playlistReels[0].reel.thumbnailUrl
        : `https://placehold.co/400x400/1a1a1a/ffffff?text=${encodeURIComponent(playlist.name)}`;

    const reelCount = hasReels ? playlist.playlistReels.length : 0;

    return (
        <div
            onClick={onClick}
            className="aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-pointer group relative shadow-lg"
        >
            <img
                src={thumbnailUrl}
                alt={playlist.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                <h3 className="font-bold text-lg text-white truncate">{playlist.name}</h3>
                <p className="text-xs text-gray-300">
                    {reelCount} {reelCount === 1 ? 'reel' : 'reels'}
                </p>
            </div>
        </div>
    );
};

export default PlaylistCard;