import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomeIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> );
const ProfileIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> );
const PopularIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> );
const SettingsIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const NotificationIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> );
const CheckAllIcon = () => ( <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const PlaceholderUserIcon = () => ( <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> );
const ChatIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> );
const UsersIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> );

const NavItem = ({ icon, label, to = "#", badge = false }) => (
    <li>
        <Link to={to} className="flex items-center justify-between text-gray-400 hover:text-white">
            <div className="flex items-center space-x-3">
                {icon}
                <span className="font-semibold">{label}</span>
            </div>
            {badge && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
        </Link>
    </li>
);

const NavButton = ({ icon, label, badge = false, onClick, isActive = false }) => (
    <li>
        <button
            onClick={onClick}
            className={`flex items-center justify-between w-full transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}
        >
            <div className="flex items-center space-x-3">
                {icon}
                <span className={isActive ? "font-bold" : "font-semibold"}>{label}</span>
            </div>
            {badge && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
        </button>
    </li>
);

const NotificationItem = ({ notification, onNotificationClick }) => {
    const handleClick = () => { if (!notification.read) onNotificationClick(notification); };
    return (
        <Link to={notification.relativeUrl} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors" onClick={handleClick}>
            {notification.actorProfilePictureUrl ? (
                <img src={notification.actorProfilePictureUrl} alt={notification.actorUsername} className="w-9 h-9 rounded-full flex-shrink-0" />
            ) : (
                <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0"><PlaceholderUserIcon /></div>
            )}
            <div className="text-sm overflow-hidden">
                <p className="text-white font-medium truncate">{notification.title}</p>
                <p className="text-gray-400 truncate">{notification.body}</p>
            </div>
            {!notification.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-auto flex-shrink-0"></div>}
        </Link>
    );
};

export default function NavigationPanel({
                                            user,
                                            auth,
                                            appUser,
                                            isOpen,
                                            unreadCount,
                                            notifications,
                                            handleMarkAllAsRead,
                                            handleMarkOneAsRead,
                                            totalUnreadChats,
                                            setIsChatModalOpen,
                                            activeFeed,
                                            setActiveFeed
                                        }) {
    const { t } = useTranslation();
    const username = appUser ? appUser.username : user.email.split('@')[0];
    const [isListOpen, setIsListOpen] = useState(false);

    const location = useLocation();
    const isMainPage = location.pathname === '/';

    const scrollbarStyles = `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
    `;

    return (
        <>
            <style>{scrollbarStyles}</style>
            <nav className={`absolute top-0 left-0 h-full w-72 bg-black/80 backdrop-blur-md border-r border-gray-800 p-6 flex flex-col justify-between transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <h1 className="text-2xl font-bold mb-10">Vibez</h1>

                    {isMainPage ? (
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-4 tracking-wider">{t('feeds')}</p>
                            <ul className="space-y-4">
                                <NavButton
                                    icon={<HomeIcon />}
                                    label={t('forYou')}
                                    isActive={activeFeed === 'FOR_YOU'}
                                    onClick={() => setActiveFeed('FOR_YOU')}
                                />
                                <NavButton
                                    icon={<UsersIcon />}
                                    label={t('followingFeed')}
                                    isActive={activeFeed === 'FOLLOWING'}
                                    onClick={() => setActiveFeed('FOLLOWING')}
                                />
                                <NavButton
                                    icon={<PopularIcon />}
                                    label={t('popular')}
                                    isActive={activeFeed === 'POPULAR'}
                                    onClick={() => setActiveFeed('POPULAR')}
                                />
                            </ul>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-4 tracking-wider">{t('navigation')}</p>
                            <ul className="space-y-4">
                                <NavItem icon={<HomeIcon />} label={t('mainPage')} to="/" />
                            </ul>
                        </div>
                    )}

                    <div className="border-t border-gray-800 pt-6">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-4 tracking-wider">{t('menu')}</p>
                        <ul className="space-y-4">
                            <NavItem icon={<ProfileIcon />} label={t('profile')} to={`/profile/${username}`} />
                            <NavButton
                                icon={<ChatIcon />}
                                label={t('messages')}
                                badge={totalUnreadChats > 0}
                                onClick={() => setIsChatModalOpen(true)}
                            />
                            <NavButton
                                icon={<NotificationIcon />}
                                label={t('notifications')}
                                badge={unreadCount > 0}
                                onClick={() => setIsListOpen(!isListOpen)}
                            />

                            {isListOpen && (
                                <div className="ml-4 mt-2 p-3 bg-gray-900 rounded-lg shadow-lg space-y-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 p-2 -ml-2 mb-1"
                                        >
                                            <CheckAllIcon />
                                            <span>{t('markAllRead')}</span>
                                        </button>
                                    )}

                                    <ul className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                        {notifications && notifications.length > 0 ? (
                                            notifications.slice(0, 10).map(notif => (
                                                <li key={notif.id}>
                                                    <NotificationItem
                                                        notification={notif}
                                                        onNotificationClick={handleMarkOneAsRead}
                                                    />
                                                </li>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm p-2">{t('noNotifications')}</p>
                                        )}
                                    </ul>
                                </div>
                            )}
                            <NavItem icon={<SettingsIcon />} label={t('settings')} to="#" />
                        </ul>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-gray-500">{t('loggedInAs')}</p>
                    <p className="text-sm font-bold truncate">{user.email}</p>
                    <button onClick={async () => await signOut(auth)} className="w-full mt-4 text-left text-sm text-gray-400 hover:text-white">{t('logout')}</button>
                </div>
            </nav>
        </>
    );
}