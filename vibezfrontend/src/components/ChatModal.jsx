import React, { useState, useEffect, useRef } from 'react';

// --- Ikony ---
const CloseIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
const SendIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>);
const NewChatIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);

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
                                      createOrGetPrivateChat
                                  }) {
    const [activeRoomId, setActiveRoomId] = useState(null);
    const [messageContent, setMessageContent] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    const activeRoom = chatRooms.find(r => r.id === activeRoomId);
    const messagesEndRef = useRef(null);

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
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages, activeRoomId]);


    const handleRoomClick = (roomId) => {
        setActiveRoomId(roomId);
        setIsCreatingChat(false);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageContent.trim() && activeRoomId) {
            sendChatMessage(activeRoomId, messageContent.trim(), null);
            setMessageContent("");
        }
    };

    const handleCreateChat = async () => {
        if (searchTerm.trim() === "" || searchTerm.trim() === appUser.username) return;

        const newRoom = await createOrGetPrivateChat(searchTerm.trim());
        if (newRoom) {
            setActiveRoomId(newRoom.id);
            setIsCreatingChat(false);
            setSearchTerm("");
        }
    };

    if (!isOpen) return null;

    const getPrivateChatPartner = (room) => {
        if (room.type !== 'PRIVATE' || !room.participants) return null;
        return room.participants.find(p => p.username !== appUser.username);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-black/50 backdrop-blur-lg w-full max-w-4xl h-[80vh] rounded-lg shadow-xl flex overflow-hidden border border-gray-700 text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <aside className="w-1/3 border-r border-gray-700 flex flex-col bg-gray-900/50">
                    <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-semibold">{appUser.username}</h2>
                        <button
                            onClick={() => setIsCreatingChat(true)}
                            className="p-1 text-gray-400 hover:text-white"
                            title="Nowa wiadomość"
                        >
                            <NewChatIcon />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto">
                        {isCreatingChat ? (
                            <div className="p-4">
                                <h3 className="text-gray-300 mb-2">Do kogo:</h3>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Wpisz nazwę użytkownika..."
                                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md outline-none text-white"
                                />
                                <button
                                    onClick={handleCreateChat}
                                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-md p-2 mt-3"
                                >
                                    Rozpocznij czat
                                </button>
                            </div>
                        ) : (
                            <ul>
                                {chatRooms.map(room => {
                                    const partner = getPrivateChatPartner(room);
                                    const roomName = room.type === 'GROUP' ? room.name : (partner?.username || 'Czat prywatny');
                                    const roomPic = room.type === 'PRIVATE' ? partner?.profilePictureUrl : null;
                                    const unreadCount = unreadMessages[room.id] || 0;

                                    return (
                                        <li
                                            key={room.id}
                                            onClick={() => handleRoomClick(room.id)}
                                            className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-800 ${activeRoomId === room.id ? 'bg-gray-700' : ''}`}
                                        >
                                            {roomPic ? (
                                                <img src={roomPic} alt={roomName} className="w-12 h-12 rounded-full flex-shrink-0" />
                                            ) : (
                                                <AvatarPlaceholder username={roomName} className="w-12 h-12" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">{roomName}</p>
                                                <p className="text-sm text-gray-400 truncate">
                                                    {room.lastMessage?.content || "Rozpocznij konwersację"}
                                                </p>
                                            </div>
                                            {unreadCount > 0 && (
                                                <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-1">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </aside>

                <section className="w-2/3 flex flex-col">
                    {activeRoom ? (
                        <>
                            <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-semibold">
                                    {activeRoom.type === 'GROUP' ? activeRoom.name : getPrivateChatPartner(activeRoom)?.username}
                                </h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-white">
                                    <CloseIcon />
                                </button>
                            </header>

                            <div className="flex-1 p-4 overflow-y-auto space-y-2">
                                {(chatMessages[activeRoomId] || []).map((msg, index) => {
                                    const prevMsg = (chatMessages[activeRoomId] || [])[index - 1];
                                    const showTimestamp = !prevMsg || (new Date(msg.timestamp) - new Date(prevMsg.timestamp)) > 1000 * 60 * 10;

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showTimestamp && <TimestampDivider timestamp={msg.timestamp} />}
                                            <MessageBubble
                                                message={msg}
                                                isMe={msg.sender.username === appUser.username}
                                                onEdit={editChatMessage}
                                                onDelete={deleteChatMessage}
                                            />
                                        </React.Fragment>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        placeholder="Napisz wiadomość..."
                                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-full outline-none text-white"
                                        maxLength={100}
                                    />
                                    <button type="submit" className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700">
                                        <SendIcon />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 text-right pr-4 mt-1">
                                    {messageContent.length} / 100
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <h2 className="text-xl">Wybierz czat</h2>
                            <p>Lub rozpocznij nową konwersację.</p>
                            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                                <CloseIcon />
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

//TODO: editing and deleting messages

function MessageBubble({ message, isMe, onEdit, onDelete }) {
    const sender = message.sender;

    return (
        <div className={`flex items-start space-x-3 ${isMe ? 'justify-end' : 'justify-start'}`}>

            {!isMe && (
                <div className="flex-shrink-0">
                    {sender.profilePictureUrl ? (
                        <img src={sender.profilePictureUrl} alt={sender.username} className="w-10 h-10 rounded-full" />
                    ) : (
                        <AvatarPlaceholder username={sender.username} className="w-10 h-10" />
                    )}
                </div>
            )}

            <div className={`p-3 rounded-2xl max-w-xs lg:max-w-md ${
                isMe ? 'bg-gray-800 rounded-br-lg text-white'
                    : 'bg-gray-700 rounded-bl-lg text-white'
            }`}>

                {!isMe && (
                    <p className="text-xs font-bold text-blue-300 mb-1">{sender.username}</p>
                )}

                {message.reel && (
                    <div className="bg-gray-900 p-2 rounded-lg mb-2">
                        <img src={message.reel.thumbnailUrl} alt="Reel" className="w-full rounded-md" />
                        <p className="mt-1 text-sm font-semibold">{message.reel.songTitle}</p>
                        <p className="text-xs text-gray-400">{message.reel.author}</p>
                    </div>
                )}

                {message.content && (
                    <p className="break-words whitespace-pre-wrap">
                        {message.content}
                    </p>
                )}

                {message.isEdited && (
                    <span className="text-xs text-gray-400 mt-1 block text-right">(edytowano)</span>
                )}
            </div>
        </div>
    );
}