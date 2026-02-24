import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/apiClient';
import ReelPreview from './ReelPreview';

const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #000; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
`;

const CloseIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
const SendIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>);
const NewChatIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const KebabIcon = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>);
const XIcon = () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
const UsersIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const PlusIcon = () => (<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
const BackIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);

const AvatarPlaceholder = ({ username, className = "w-10 h-10" }) => {
    const initials = username?.substring(0, 2).toUpperCase() || '??';
    return (
        <div className={`rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center font-bold text-white ${className}`}>
            {initials}
        </div>
    );
};

const formatMessageTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const msgDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - msgDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 24) {
        return msgDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
            msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const TimestampDivider = ({ timestamp }) => (
    <div className="flex justify-center items-center my-4">
        <span className="text-xs text-gray-400 px-2">
            {formatMessageTimestamp(timestamp)}
        </span>
    </div>
);

export default function ChatModal({
                                      isOpen,
                                      onClose,
                                      appUser,
                                      chatRooms,
                                      chatMessages,
                                      unreadMessages,
                                      setUnreadMessages,
                                      fetchChatHistory,
                                      sendChatMessage,
                                      editChatMessage,
                                      deleteChatMessage,
                                      createOrGetPrivateChat,
                                      createGroupChat,
                                      activeRoomId,
                                      setActiveRoomId
                                  }) {
    const { t } = useTranslation();
    const [messageContent, setMessageContent] = useState("");
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [isGroupMode, setIsGroupMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState("");

    const activeRoom = chatRooms.find(r => r.id === activeRoomId);
    const messagesEndRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const prevRoomIdRef = useRef(null);

    useEffect(() => {
        if (activeRoomId) {
            if (!chatMessages[activeRoomId] || chatMessages[activeRoomId].length === 0) {
                fetchChatHistory(activeRoomId, 0, 50);
            }

            if (unreadMessages[activeRoomId] > 0) {
                setUnreadMessages(prev => ({ ...prev, [activeRoomId]: 0 }));
            }
        }
    }, [activeRoomId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            const isRoomChange = prevRoomIdRef.current !== activeRoomId;
            const behavior = isRoomChange ? "auto" : "smooth";

            messagesEndRef.current.scrollIntoView({ behavior });
            prevRoomIdRef.current = activeRoomId;
        }
    }, [chatMessages, activeRoomId]);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await apiClient(`/users/search?query=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    const filtered = data.filter(u =>
                        u.username !== appUser.username &&
                        !selectedUsers.find(sel => sel.username === u.username)
                    );
                    setSearchResults(filtered);
                }
            } catch (error) {
                console.error("Search error:", error);
            }
        }, 300);
    };

    const handleSelectUser = async (user) => {
        setSearchQuery("");
        setSearchResults([]);

        if (isGroupMode) {
            if (!selectedUsers.find(u => u.username === user.username)) {
                setSelectedUsers(prev => [...prev, user]);
            }
        } else {
            const room = await createOrGetPrivateChat(user.username);
            if (room) {
                setActiveRoomId(room.id);
                setIsSearchMode(false);
            }
        }
    };

    const handleRemoveSelectedUser = (username) => {
        setSelectedUsers(prev => prev.filter(u => u.username !== username));
    };

    const handleCreateGroupSubmit = async () => {
        if (!createGroupChat) return;
        if (selectedUsers.length === 0) return;

        const usernames = selectedUsers.map(u => u.username);
        usernames.push(appUser.username);

        const name = groupName.trim() || selectedUsers.map(u => u.username).join(", ").substring(0, 30);

        const newRoom = await createGroupChat(usernames, name);
        if (newRoom) {
            setActiveRoomId(newRoom.id);
            setIsGroupMode(false);
            setIsSearchMode(false);
            setSelectedUsers([]);
            setGroupName("");
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageContent.trim() && activeRoomId) {
            sendChatMessage(activeRoomId, messageContent.trim(), null);
            setMessageContent("");
        }
    };

    const getPrivateChatPartner = (room) => {
        if (room.type !== 'PRIVATE' || !room.participants) return null;
        return room.participants.find(p => p.username !== appUser.username);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/15 z-40 flex items-center justify-center"
            onClick={onClose}
        >
            <style>{scrollbarStyles}</style>

            <div
                className="bg-black/15 backdrop-blur-lg w-full max-w-5xl h-[100dvh] md:h-[80vh] rounded-none md:rounded-lg shadow-xl flex overflow-hidden border-0 md:border border-gray-700 text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <aside className={`flex-col bg-black/5 relative w-full md:w-1/3 md:min-w-[300px] border-r border-gray-700 ${activeRoomId ? 'hidden md:flex' : 'flex'}`}>
                    <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-semibold">{appUser.username}</h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => {
                                    setIsSearchMode(!isSearchMode);
                                    if (!isSearchMode) setTimeout(() => document.getElementById('search-input')?.focus(), 100);
                                }}
                                className={`p-1 rounded transition-colors ${isSearchMode ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                                title={t('newMessage')}
                            >
                                <NewChatIcon />
                            </button>
                            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                                <CloseIcon />
                            </button>
                        </div>
                    </header>

                    {isSearchMode && (
                        <div className="p-3 bg-gray-800/30 border-b border-gray-700">
                            <div className="flex items-center space-x-2 mb-2">
                                <input
                                    id="search-input"
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder={t('searchPeople')}
                                    className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-sm text-white outline-none"
                                />
                                {isGroupMode && (
                                    <button
                                        onClick={handleCreateGroupSubmit}
                                        disabled={selectedUsers.length === 0}
                                        className="bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-500 disabled:opacity-50"
                                    >
                                        {t('create')}
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center text-xs text-gray-400 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isGroupMode}
                                        onChange={(e) => setIsGroupMode(e.target.checked)}
                                        className="mr-2 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-0"
                                    />
                                    {t('groupMode')}
                                </label>
                            </div>

                            {isGroupMode && selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-800/50 rounded border border-gray-700">
                                    {selectedUsers.map(u => (
                                        <span key={u.username} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full flex items-center">
                                            {u.username}
                                            <button onClick={() => handleRemoveSelectedUser(u.username)} className="ml-1 hover:text-white"><XIcon /></button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {isGroupMode && selectedUsers.length > 0 && (
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder={t('groupNameOptional')}
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-xs text-white mb-2"
                                />
                            )}
                        </div>
                    )}

                    {searchQuery.length >= 2 && searchResults.length > 0 && (
                        <div className="absolute top-[130px] left-0 right-0 z-20 bg-gray-800 border-y border-gray-600 shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                            {searchResults.map(user => (
                                <div
                                    key={user.username}
                                    onClick={() => handleSelectUser(user)}
                                    className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
                                >
                                    <AvatarPlaceholder username={user.username} className="w-8 h-8 mr-3" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{user.username}</p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                    {isGroupMode && <PlusIcon />}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
                        <ul>
                            {chatRooms.map(room => {
                                const partner = getPrivateChatPartner(room);
                                const roomName = room.type === 'GROUP' ? room.name : (partner?.username || t('privateChat'));
                                const roomPic = room.type === 'PRIVATE' ? partner?.profilePictureUrl : null;
                                const unreadCount = unreadMessages[room.id] || 0;

                                return (
                                    <li
                                        key={room.id}
                                        onClick={() => { setActiveRoomId(room.id); setIsSearchMode(false); }}
                                        className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-800 ${activeRoomId === room.id ? 'bg-gray-700' : ''}`}
                                    >
                                        {roomPic ? (
                                            <img src={roomPic} alt={roomName} className="w-12 h-12 rounded-full flex-shrink-0" />
                                        ) : (
                                            room.type === 'GROUP' ? (
                                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                                                    <UsersIcon />
                                                </div>
                                            ) : (
                                                <AvatarPlaceholder username={roomName} className="w-12 h-12" />
                                            )
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{roomName}</p>
                                            <p className="text-sm text-gray-400 truncate">
                                                {room.lastMessage ? (
                                                    <>
                                                        {room.type === 'GROUP' && <span className="text-blue-400 mr-1">{room.lastMessage.sender.username}:</span>}
                                                        {room.lastMessage.content}
                                                    </>
                                                ) : t('startConversation')}
                                            </p>
                                        </div>
                                        {unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </aside>

                <section className={`flex-col w-full md:w-2/3 ${activeRoomId ? 'flex' : 'hidden md:flex'}`}>
                    {activeRoom ? (
                        <>
                            <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <button
                                        className="md:hidden text-gray-400 hover:text-white -ml-2"
                                        onClick={() => setActiveRoomId(null)}
                                    >
                                        <BackIcon />
                                    </button>

                                    {activeRoom.type === 'PRIVATE' ? (
                                        getPrivateChatPartner(activeRoom)?.profilePictureUrl ? (
                                            <img src={getPrivateChatPartner(activeRoom).profilePictureUrl} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <AvatarPlaceholder username={getPrivateChatPartner(activeRoom)?.username} className="w-8 h-8" />
                                        )
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                                            <UsersIcon />
                                        </div>
                                    )}
                                    <h2 className="text-xl font-semibold truncate max-w-[150px] sm:max-w-xs">
                                        {activeRoom.type === 'GROUP' ? activeRoom.name : getPrivateChatPartner(activeRoom)?.username}
                                    </h2>
                                </div>
                                <button onClick={onClose} className="text-gray-400 hover:text-white hidden md:block">
                                    <CloseIcon />
                                </button>
                                <button onClick={onClose} className="text-gray-400 hover:text-white md:hidden">
                                    <CloseIcon />
                                </button>
                            </header>

                            <div className="flex-1 p-4 overflow-y-auto space-y-2 custom-scrollbar bg-black/5">
                                {(chatMessages[activeRoomId] || []).map((msg, index) => {
                                    const currentMessages = chatMessages[activeRoomId] || [];
                                    const prevMsg = currentMessages[index - 1];
                                    const nextMsg = currentMessages[index + 1];

                                    const showTimestamp = !prevMsg || (new Date(msg.timestamp) - new Date(prevMsg.timestamp)) > 1000 * 60 * 10;

                                    const nextMsgDiff = nextMsg ? new Date(nextMsg.timestamp) - new Date(msg.timestamp) : 0;
                                    const nextWillBreakSequence = nextMsgDiff > 1000 * 60 * 10;

                                    const showAvatar = !nextMsg ||
                                        nextMsg.sender.username !== msg.sender.username ||
                                        nextWillBreakSequence;

                                    const isFirstFromSender = !prevMsg || prevMsg.sender.username !== msg.sender.username || showTimestamp;

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showTimestamp && <TimestampDivider timestamp={msg.timestamp} />}
                                            <MessageBubble
                                                message={msg}
                                                isMe={msg.sender.username === appUser.username}
                                                onEdit={editChatMessage}
                                                onDelete={deleteChatMessage}
                                                showAvatar={showAvatar}
                                                showNickname={isFirstFromSender && activeRoom.type === 'GROUP'}
                                            />
                                        </React.Fragment>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-black/10">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        placeholder={t('writeMessage')}
                                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-full outline-none text-white text-sm"
                                        maxLength={500}
                                    />
                                    <button type="submit" className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 flex-shrink-0">
                                        <SendIcon />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <h2 className="text-xl">{t('selectChat')}</h2>
                            <p>{t('startNewConversation')}</p>
                            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white hidden md:block">
                                <CloseIcon />
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function MessageBubble({ message, isMe, onEdit, onDelete, showAvatar, showNickname }) {
    const { t } = useTranslation();
    const sender = message.sender;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content || "");

    const isDeleted = message.content === "[Wiadomość usunięta]";

    const handleSaveEdit = () => {
        if (editContent.trim() !== "") {
            onEdit(message.id, editContent);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(message.content || "");
    };

    const handleDelete = () => {
        onDelete(message.id);
        setIsMenuOpen(false);
    };

    return (
        <div className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'} group relative`}>

            {!isMe && (
                <div className="flex-shrink-0 w-8 md:w-10">
                    {showAvatar ? (
                        sender.profilePictureUrl ? (
                            <img src={sender.profilePictureUrl} alt={sender.username} className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
                        ) : (
                            <AvatarPlaceholder username={sender.username} className="w-8 h-8 md:w-10 md:h-10" />
                        )
                    ) : (
                        <div className="w-8 h-8 md:w-10 md:h-10" />
                    )}
                </div>
            )}

            {isMe && !isEditing && !isDeleted && (
                <div className="relative self-center mb-3">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-500 hover:text-white p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <KebabIcon />
                    </button>
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                            <div className="absolute right-0 bottom-8 w-32 bg-gray-800 border border-gray-600 rounded shadow-lg z-20 overflow-hidden">
                                <button
                                    onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
                                >
                                    {t('edit')}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-red-900/50 text-red-400"
                                >
                                    {t('delete')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="flex flex-col max-w-[75%] lg:max-w-md">
                {!isMe && showNickname && (
                    <span className="text-[10px] text-gray-400 ml-1 mb-1 font-bold">{sender.username}</span>
                )}

                <div className={`p-3 rounded-2xl w-full text-sm md:text-base ${isMe ? 'bg-gray-800 rounded-br-lg text-white' : 'bg-gray-700 rounded-bl-lg text-white'} ${isDeleted ? 'bg-gray-600/50 italic text-gray-400' : ''}`}>

                    {message.reel && !isDeleted && (
                        <div className="mb-2 w-full overflow-hidden rounded-lg border border-gray-600/30">
                            <ReelPreview reel={message.reel} />
                        </div>
                    )}

                    {isEditing ? (
                        <div className="flex flex-col space-y-2 min-w-[150px]">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 bg-gray-900 text-white border border-gray-600 rounded text-sm outline-none resize-none"
                                rows={2}
                            />
                            <div className="flex justify-end space-x-2 text-xs">
                                <button onClick={handleCancelEdit} className="text-gray-400 hover:text-white">{t('cancel')}</button>
                                <button onClick={handleSaveEdit} className="text-blue-400 hover:text-blue-300 font-semibold">{t('save')}</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isDeleted ? (
                                <p className="text-sm select-none">{t('messageDeleted')}</p>
                            ) : (
                                <p className="break-words whitespace-pre-wrap">
                                    {message.content}
                                </p>
                            )}

                            {!isDeleted && message.edited && (
                                <span className="text-xs text-gray-400 mt-1 block text-right">{t('editedStatus')}</span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}