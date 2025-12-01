package com.vibez.service;

import com.vibez.model.Comment;
import com.vibez.model.CommentLike;
import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.CommentLikeRepository;
import com.vibez.repository.CommentRepository;
import com.vibez.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final ReelRepository reelRepository;

    public CommentService(CommentRepository commentRepository, UserRepository userRepository, CommentLikeRepository commentLikeRepository, ReelRepository reelRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.reelRepository = reelRepository;
    }

    @Transactional
    public Comment likeComment(Long commentId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found: " + commentId));

        if (commentLikeRepository.existsByUserAndComment(user, comment)) {
            return comment;
        }

        CommentLike newLike = new CommentLike(user, comment);

        try {
            commentLikeRepository.save(newLike);
            comment.incrementLikeCount();
            return commentRepository.save(comment);

        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Like operation failed due to concurrent modification.", e);
        }
    }

    @Transactional
    public Comment unlikeComment(Long commentId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found: " + commentId));

        CommentLike like = commentLikeRepository.findByUserAndComment(user, comment)
                .orElseThrow(() -> new EntityNotFoundException("CommentLike not found"));

        commentLikeRepository.delete(like);
        comment.decrementLikeCount();
        return commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public Set<Long> getLikedCommentIdsByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        List<CommentLike> likedComments = commentLikeRepository.findByUser(user);
        return likedComments.stream()
                .map(commentLike -> commentLike.getComment().getId())
                .collect(Collectors.toSet());
    }
    @Transactional
    public Comment addComment(String text, Long reelId, String username, Long parentCommentId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new EntityNotFoundException("Reel not found: " + reelId));

        Comment newComment = new Comment();
        newComment.setText(text);
        newComment.setUser(user);
        newComment.setReel(reel);

        if (parentCommentId != null) {
            Comment parentComment = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new EntityNotFoundException("Parent comment not found: " + parentCommentId));
            newComment.setParentComment(parentComment);
        }

        return commentRepository.save(newComment);
    }
}