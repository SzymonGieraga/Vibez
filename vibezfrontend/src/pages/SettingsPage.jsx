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

            <div className={`flex-1 flex flex-col transition-all duration-300 ${isNavOpen ? 'ml-72' : 'ml-0'}`}>
                <div className="p-8 max-w-4xl w-full mx-auto">
                    <h1 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-4">{t('settings')}</h1>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-4 text-gray-300">{t('preferences')}</h2>
                        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">{t('language')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{t('chooseAppLanguage')}</p>
                                </div>
                                <LanguageSwitcher />
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-4 text-gray-300">{t('account') || 'Account'}</h2>
                        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">{t('loggedInAs')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
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