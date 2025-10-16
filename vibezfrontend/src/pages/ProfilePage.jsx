import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

// Komponenty Ikon
const EditIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>;
const MenuIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> );
const HomeIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> );
const ProfileIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> );
const PopularIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> );
const SettingsIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );

export default function ProfilePage({ auth, currentUser }) {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [reels, setReels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const loggedInUsername = currentUser.email.split('@')[0];
    const isOwnProfile = profile ? profile.username === loggedInUsername : false;

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                const [profileRes, reelsRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/users/${username}`),
                    fetch(`http://localhost:8080/api/reels/user/${username}`)
                ]);

                if (!profileRes.ok) throw new Error(`Profile not found for ${username}`);
                if (!reelsRes.ok) throw new Error(`Reels not found for ${username}`);

                const profileData = await profileRes.json();
                const reelsData = await reelsRes.json();

                setProfile(profileData);
                setReels(reelsData);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setProfile(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [username]);

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
        if (username !== updatedProfile.username) {
            navigate(`/profile/${updatedProfile.username}`);
        }
    };

    if (isLoading) {
        return <div className="bg-black text-white flex items-center justify-center h-screen">Loading Profile...</div>;
    }

    if (!profile) {
        return <div className="bg-black text-white flex items-center justify-center h-screen">Profile not found.</div>;
    }

    return (
        <div className="w-screen h-screen bg-black text-white relative overflow-hidden">
            <main className="w-full h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
                    <header className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                        <img
                            src={profile.profilePictureUrl || `https://ui-avatars.com/api/?name=${profile.username}&background=222&color=fff&size=128`}
                            alt="Profile"
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-gray-700"
                        />
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold">{profile.username}</h1>
                            <p className="text-gray-400 mt-2 max-w-md">{profile.bio || "No bio yet."}</p>
                            {isOwnProfile && (
                                <button onClick={() => setIsEditModalOpen(true)} className="mt-4 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center mx-auto sm:mx-0">
                                    <EditIcon /> Edit Profile
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="border-t border-gray-800 pt-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                            {reels.map(reel => (
                                <div key={reel.id} className="aspect-w-9 aspect-h-16 bg-gray-900 group relative">
                                    <img src={reel.thumbnailUrl || 'https://placehold.co/360x640/1a1a1a/ffffff?text=No+Thumbnail'} alt={reel.description} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                        <p className="text-white text-sm font-bold text-center">{reel.songTitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <div className="absolute top-4 left-4 z-30">
                <button onClick={() => setIsNavOpen(true)} className="p-2 bg-black/30 rounded-full hover:bg-black/50">
                    <MenuIcon />
                </button>
            </div>
            <nav className={`absolute top-0 left-0 h-full w-72 bg-black/80 backdrop-blur-md border-r border-gray-800 p-6 flex flex-col justify-between transition-transform duration-300 z-40 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <h1 className="text-2xl font-bold mb-10">Vibez</h1>
                    <ul className="space-y-4">
                        <NavItem icon={<HomeIcon />} label="Main Page" to="/" />
                        <NavItem icon={<ProfileIcon />} label="Your Profile" to={`/profile/${loggedInUsername}`} />
                        <NavItem icon={<PopularIcon />} label="Popular" to="#" />
                        <NavItem icon={<SettingsIcon />} label="Settings" to="#" />
                    </ul>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Logged in as:</p>
                    <p className="text-sm font-bold truncate">{currentUser.email}</p>
                    <button onClick={async () => await signOut(auth)} className="w-full mt-4 text-left text-sm text-gray-400 hover:text-white">Logout</button>
                </div>
            </nav>
            {isNavOpen && <div className="absolute inset-0 bg-black/30 z-20" onClick={() => setIsNavOpen(false)} />}

            {isEditModalOpen && <EditProfileModal user={profile} onClose={() => setIsEditModalOpen(false)} onProfileUpdate={handleProfileUpdate} />}
        </div>
    );
}

const NavItem = ({ icon, label, to }) => (
    <li>
        <Link to={to} className="flex items-center space-x-3 text-gray-400 hover:text-white cursor-pointer">
            {icon}
            <span className="font-semibold">{label}</span>
        </Link>
    </li>
);

function EditProfileModal({ user, onClose, onProfileUpdate }) {
    const [username, setUsername] = useState(user.username || '');
    const [bio, setBio] = useState(user.bio || '');
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setError('');

        let profilePictureUrl = user.profilePictureUrl;

        try {
            if (profilePicFile) {
                const fileName = `${Date.now()}_${profilePicFile.name}`;
                const presignedUrlRes = await fetch(`http://localhost:8080/api/reels/generate-upload-url?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(profilePicFile.type)}`);
                if (!presignedUrlRes.ok) throw new Error('Could not get upload URL for profile picture.');

                const presignedUrl = await presignedUrlRes.text();

                const uploadRes = await fetch(presignedUrl, { method: 'PUT', body: profilePicFile, headers: { 'Content-Type': profilePicFile.type } });
                if (!uploadRes.ok) throw new Error('Profile picture upload failed.');

                const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
                if(!r2PublicUrl) throw new Error("VITE_R2_PUBLIC_URL is not defined in .env.local");

                profilePictureUrl = `${r2PublicUrl}/${fileName}`;
            }

            const updateRes = await fetch(`http://localhost:8080/api/users/${user.username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, bio, profilePictureUrl })
            });

            if (updateRes.status === 409) throw new Error('Username already taken.');
            if (!updateRes.ok) throw new Error('Failed to update profile.');

            const updatedProfile = await updateRes.json();
            onProfileUpdate(updatedProfile);
            onClose();

        } catch (err) {
            setError(err.message);
            console.error("Error updating profile:", err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 p-8 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Profile Picture</label>
                        <input type="file" accept="image/*" onChange={(e) => setProfilePicFile(e.target.files[0])} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="3" className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} disabled={isUploading} className="mr-4 py-2 px-4 text-sm font-medium text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" disabled={isUploading} className="py-2 px-6 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-500">
                            {isUploading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

