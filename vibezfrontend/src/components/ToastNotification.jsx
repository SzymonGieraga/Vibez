import React from 'react';
import { Link } from 'react-router-dom';

const NotificationBellIcon = () => (
    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

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
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-auto max-w-sm bg-gray-900/90 backdrop-blur-md border border-gray-700 text-white p-4 rounded-lg shadow-2xl animate-fade-in-down">
            <div className="flex items-start space-x-3">
                <Link
                    to={notification.relativeUrl}
                    className="flex items-start space-x-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                    onClick={handleLinkClick}
                >
                    {notification.actorProfilePictureUrl ? (
                        <img src={notification.actorProfilePictureUrl} alt={notification.actorUsername} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                            <NotificationBellIcon />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-sm">{notification.title || 'Nowe powiadomienie!'}</p>
                        <p className="text-sm text-gray-300 line-clamp-2">{notification.body}</p>
                    </div>
                </Link>
                <button onClick={handleCloseClick} className="text-gray-500 hover:text-white flex-shrink-0 ml-2">
                    &times;
                </button>
            </div>
        </div>
    );
};

export default ToastNotification;