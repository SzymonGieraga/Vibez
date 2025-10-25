import React from 'react';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

// --- Ikony ---
const HomeIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> );
const ProfileIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> );
const PopularIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> );
const SettingsIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );

const NavItem = ({ icon, label, to = "#" }) => (
    <li>
        <Link to={to} className="flex items-center space-x-3 text-gray-400 hover:text-white">
            {icon}
            <span className="font-semibold">{label}</span>
        </Link>
    </li>
);

export default function NavigationPanel({ user, auth, appUser, isOpen }) {
    const username = appUser ? appUser.username : user.email.split('@')[0];

    return (
        <nav className={`absolute top-0 left-0 h-full w-72 bg-black/80 backdrop-blur-md border-r border-gray-800 p-6 flex flex-col justify-between transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div>
                <h1 className="text-2xl font-bold mb-10">Vibez</h1>
                <ul className="space-y-4">
                    <NavItem icon={<HomeIcon />} label="Main Page" to="/" />
                    <NavItem icon={<ProfileIcon />} label="Your Profile" to={`/profile/${username}`} />
                    <NavItem icon={<PopularIcon />} label="Popular" to="#" />
                    <NavItem icon={<SettingsIcon />} label="Settings" to="#" />
                </ul>
            </div>
            <div>
                <p className="text-xs text-gray-500">Logged in as:</p>
                <p className="text-sm font-bold truncate">{user.email}</p>
                <button onClick={async () => await signOut(auth)} className="w-full mt-4 text-left text-sm text-gray-400 hover:text-white">Logout</button>
            </div>
        </nav>
    );
}
