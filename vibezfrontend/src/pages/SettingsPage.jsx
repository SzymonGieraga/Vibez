import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import NavigationPanel from '../components/NavigationPanel';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function SettingsPage({
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
    const { t } = useTranslation();
    const [isNavOpen, setIsNavOpen] = useState(true);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
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
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${isNavOpen ? 'ml-20 md:ml-72' : 'ml-0'}`}>
                <div className="p-4 md:p-8 max-w-4xl w-full mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 border-b border-gray-800 pb-4">{t('settings')}</h1>

                    <section className="mb-8 md:mb-10">
                        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-300">{t('preferences')}</h2>
                        <div className="bg-gray-900/50 rounded-xl p-4 md:p-6 border border-gray-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-white font-medium">{t('language')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{t('chooseAppLanguage')}</p>
                                </div>
                                <LanguageSwitcher />
                            </div>
                        </div>
                    </section>

                    <section className="mb-8 md:mb-10">
                        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-300">{t('account') || 'Account'}</h2>
                        <div className="bg-gray-900/50 rounded-xl p-4 md:p-6 border border-gray-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="overflow-hidden">
                                    <h3 className="text-white font-medium">{t('loggedInAs')}</h3>
                                    <p className="text-sm text-gray-500 mt-1 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                                >
                                    {t('logout')}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}