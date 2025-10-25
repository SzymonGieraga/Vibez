import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const SmallHeartIcon = ({ isLiked, disabled }) => (
    <svg
        className={`w-4 h-4 inline -mt-0.5 ${isLiked ? 'text-red-500' : 'text-gray-500'} ${disabled ? 'opacity-50' : 'hover:text-white'}`}
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
);

const ReplyArrow = () => (
    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);

const CommentItem = ({
                         comment,
                         currentUser,
                         reelOwnerUsername,
                         onUpdate,
                         onDelete,
                         onPin,
                         likedCommentIds,
                         togglingCommentLikes,
                         onLikeToggle,
                         onSetReplyTo,
                         onCommentClick,
                         isReply = false
                     }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAllReplies, setShowAllReplies] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const isLiked = likedCommentIds.has(comment.id);
    const isLikeDisabled = togglingCommentLikes.has(comment.id);
    const isOwner = currentUser?.username === comment.user.username;
    const isReelOwner = currentUser?.username === reelOwnerUsername;
    const isEdited = new Date(comment.createdAt) < new Date(comment.lastModifiedAt);

    const handleUpdate = (e) => {
        e.preventDefault();
        onUpdate(comment.id, editText);
        setIsEditing(false);
    };

    const isLongComment = comment.text.length > 150;
    const shouldTruncate = isLongComment && !isExpanded && !isEditing;
    const displayText = shouldTruncate ? comment.text.slice(0, 150) + '...' : comment.text;

    const sortedReplies = comment.replies
        ? [...comment.replies].sort((a, b) => b.likeCount - a.likeCount)
        : [];

    const visibleReplies = showAllReplies ? sortedReplies : sortedReplies.slice(0, 3);
    const hasMoreReplies = sortedReplies.length > 3 && !showAllReplies;
    const replyCount = sortedReplies.length;

    return (
        <div className="flex flex-col">
            {comment.isPinned && !isReply && (
                <div className="text-xs text-blue-400 font-semibold mb-1 flex items-center gap-1">
                    📌 Przypięty
                </div>
            )}
            <div className="flex items-start gap-3">
                {isReply && (
                    <div className="flex-shrink-0 mt-2">
                        <ReplyArrow />
                    </div>
                )}
                <Link to={`/profile/${comment.user.username}`}>
                    <img
                        src={comment.user.profilePictureUrl || `https://ui-avatars.com/api/?name=${comment.user.username}&background=333&color=fff&size=40`}
                        alt="avatar"
                        className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Link to={`/profile/${comment.user.username}`} className="hover:text-white">
                            <span>@{comment.user.username}</span>
                        </Link>
                        {isEdited && <span>(edytowany)</span>}
                    </div>
                    {!isEditing ? (
                        <div>
                            <p
                                className="text-sm text-white cursor-pointer hover:bg-gray-800 rounded px-1 -mx-1 break-words"
                                onClick={() => onCommentClick && onCommentClick(comment)}
                            >
                                {displayText}
                            </p>
                            {shouldTruncate && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(true);
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                                >
                                    Show more
                                </button>
                            )}
                            {isExpanded && isLongComment && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(false);
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                                >
                                    Show less
                                </button>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="mt-1">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-gray-700 text-white p-2 rounded-md text-sm"
                                rows="3"
                            />
                            <div className="flex gap-2 mt-1">
                                <button type="submit" className="text-xs bg-white text-black px-2 py-1 rounded">Save</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-gray-400">Cancel</button>
                            </div>
                        </form>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 relative">
                        <button
                            onClick={() => onLikeToggle(comment.id, isLiked)}
                            disabled={isLikeDisabled}
                            className={`flex items-center gap-1 ${isLikeDisabled ? 'cursor-wait' : ''} ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-white'}`}
                        >
                            <SmallHeartIcon isLiked={isLiked} disabled={isLikeDisabled} />
                            <span className={isLiked ? 'text-red-500' : 'text-gray-500'}>{comment.likeCount}</span>
                        </button>

                        {replyCount > 0 && !isReply && (
                            <span className="text-gray-500">
                                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                            </span>
                        )}

                        <button
                            onClick={() => onSetReplyTo(comment)}
                            className="hover:text-white"
                        >
                            Reply
                        </button>
                        {(isOwner || isReelOwner) && (
                            <button onClick={() => setIsMenuOpen(prev => !prev)} className="font-bold">...</button>
                        )}
                        {isMenuOpen && (
                            <div className="absolute top-5 right-0 bg-gray-800 rounded-md shadow-lg p-2 text-white text-sm z-10 w-28">
                                {isOwner && <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="block w-full text-left p-1 hover:bg-gray-700">Edit</button>}
                                {isOwner && <button onClick={() => { onDelete(comment.id); setIsMenuOpen(false); }} className="block w-full text-left p-1 hover:bg-gray-700">Delete</button>}
                                {isReelOwner && <button onClick={() => { onPin(comment.id); setIsMenuOpen(false); }} className="block w-full text-left p-1 hover:bg-gray-700">{comment.isPinned ? 'Unpin' : 'Pin'}</button>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {!isReply && visibleReplies.length > 0 && (
                <div className="mt-4 space-y-4">
                    {visibleReplies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUser={currentUser}
                            reelOwnerUsername={reelOwnerUsername}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onPin={onPin}
                            likedCommentIds={likedCommentIds}
                            togglingCommentLikes={togglingCommentLikes}
                            onLikeToggle={onLikeToggle}
                            onSetReplyTo={onSetReplyTo}
                            onCommentClick={onCommentClick}
                            isReply={true}
                        />
                    ))}
                    {hasMoreReplies && (
                        <button
                            onClick={() => setShowAllReplies(true)}
                            className="text-xs text-blue-400 hover:text-blue-300 ml-16 flex items-center gap-1"
                        >
                            <ReplyArrow />
                            Show {sortedReplies.length - 3} more replies
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default function CommentsPanel({ isOpen, onClose, reel, currentUser, onCommentChange }) {
    const [likedCommentIds, setLikedCommentIds] = useState(new Set());
    const [togglingCommentLikes, setTogglingCommentLikes] = useState(new Set());
    const [replyingTo, setReplyingTo] = useState(null);
    const [newCommentText, setNewCommentText] = useState("");
    const [focusedComment, setFocusedComment] = useState(null);
    const textInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && currentUser?.username) {
            const fetchLikedComments = async () => {
                try {
                    const response = await fetch(`http://localhost:8080/api/comments/liked/${currentUser.username}`);
                    if (!response.ok) throw new Error('Failed to fetch liked comments');
                    const ids = await response.json();
                    setLikedCommentIds(new Set(ids));
                } catch (error) {
                    console.error("Error fetching liked comments:", error);
                }
            };
            fetchLikedComments();
        }
    }, [isOpen, currentUser, reel]);

    useEffect(() => {
        if (!isOpen) {
            setFocusedComment(null);
        }
    }, [isOpen]);

    const handleCommentLikeToggle = async (commentId, isCurrentlyLiked) => {
        if (togglingCommentLikes.has(commentId)) return;
        if (!currentUser?.username) return;

        setTogglingCommentLikes(prev => new Set(prev).add(commentId));
        const method = isCurrentlyLiked ? 'DELETE' : 'POST';
        const url = `http://localhost:8080/api/comments/${commentId}/like?username=${currentUser.username}`;

        try {
            const response = await fetch(url, { method });
            if (!response.ok) throw new Error('Failed to update comment like');
            setLikedCommentIds(prev => {
                const newSet = new Set(prev);
                if (isCurrentlyLiked) newSet.delete(commentId);
                else newSet.add(commentId);
                return newSet;
            });
            onCommentChange();
        } catch (error) {
            console.error("Error toggling comment like:", error);
        } finally {
            setTogglingCommentLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
            });
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !reel) return;

        const params = new URLSearchParams({
            text: newCommentText,
            reelId: reel.id,
            username: currentUser.username
        });

        if (replyingTo) {
            params.append('parentCommentId', replyingTo.id);
        }

        try {
            const response = await fetch(`http://localhost:8080/api/comments?${params.toString()}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to add comment');
            onCommentChange();
            setNewCommentText("");
            setReplyingTo(null);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleUpdateComment = async (commentId, text) => {
        const params = new URLSearchParams({ username: currentUser.username });
        try {
            const response = await fetch(`http://localhost:8080/api/comments/${commentId}?${params.toString()}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });
            if (!response.ok) throw new Error('Failed to update comment');
            onCommentChange();
        } catch (error) { console.error("Error updating comment:", error); }
    };

    const handleDeleteComment = async (commentId) => {
        const params = new URLSearchParams({ username: currentUser.username });
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await fetch(`http://localhost:8080/api/comments/${commentId}?${params.toString()}`, { method: 'DELETE' });
                onCommentChange();
                if (focusedComment?.id === commentId) {
                    setFocusedComment(null);
                }
            } catch (error) { console.error("Error deleting comment:", error); }
        }
    };

    const handlePinComment = async (commentId) => {
        const params = new URLSearchParams({ username: currentUser.username });
        try {
            await fetch(`http://localhost:8080/api/comments/${commentId}/pin?${params.toString()}`, { method: 'POST' });
            onCommentChange();
        } catch (error) { console.error("Error pinning comment:", error); }
    };

    const handleSetReplyTo = (comment) => {
        setReplyingTo(comment);
        textInputRef.current?.focus();
    };

    const handleCommentClick = (comment) => {
        setFocusedComment(comment);
    };

    const allComments = reel?.comments || [];
    const sortedComments = [...allComments].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
        return b.likeCount - a.likeCount;
    });

    const displayComments = focusedComment
        ? [focusedComment]
        : sortedComments;

    return (
        <div className={`absolute top-0 right-0 h-full w-96 bg-black/80 backdrop-blur-md border-l border-gray-800 flex flex-col transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">
                        {focusedComment ? 'Thread' : `Comments (${reel?.comments?.length || 0})`}
                    </h2>
                    {focusedComment && (
                        <button
                            onClick={() => setFocusedComment(null)}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                    )}
                </div>
                <button onClick={onClose} className="text-2xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {displayComments.map(comment => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUser={currentUser}
                        reelOwnerUsername={reel?.username}
                        onUpdate={handleUpdateComment}
                        onDelete={handleDeleteComment}
                        onPin={handlePinComment}
                        likedCommentIds={likedCommentIds}
                        togglingCommentLikes={togglingCommentLikes}
                        onLikeToggle={handleCommentLikeToggle}
                        onSetReplyTo={handleSetReplyTo}
                        onCommentClick={handleCommentClick}
                        isReply={false}
                    />
                ))}
            </div>

            <form onSubmit={handleAddComment} className="p-4 border-t border-gray-700">
                {replyingTo && (
                    <div className="text-xs text-gray-400 mb-2">
                        Replying to @{replyingTo.user.username}
                        <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="ml-2 text-blue-400 hover:text-blue-300 font-bold"
                        >
                            [Cancel]
                        </button>
                    </div>
                )}
                <input
                    ref={textInputRef}
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
                    className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </form>
        </div>
    );
}