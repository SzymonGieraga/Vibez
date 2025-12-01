package com.vibez.controller;

import com.vibez.dto.UpdateCommentRequest;
import com.vibez.model.Comment;
import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.repository.CommentRepository;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.vibez.service.CommentService;

import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ReelRepository reelRepository;
    private final CommentService commentService;

    public CommentController(CommentRepository commentRepository, UserRepository userRepository, ReelRepository reelRepository, CommentService commentService) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.reelRepository = reelRepository;
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<Comment> addComment(
            @RequestParam String text,
            @RequestParam Long reelId,
            @RequestParam String username,
            @RequestParam(required = false) Long parentCommentId
    ) {
        try {
            Comment savedComment = commentService.addComment(text, reelId, username, parentCommentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(null); // Lub .notFound()
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long commentId, @RequestBody UpdateCommentRequest request, @RequestParam String username) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty() || !commentOptional.get().getUser().getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Comment commentToUpdate = commentOptional.get();
        commentToUpdate.setText(request.getText());
        Comment updatedComment = commentRepository.save(commentToUpdate);
        return ResponseEntity.ok(updatedComment);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, @RequestParam String username) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty() || !commentOptional.get().getUser().getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        commentRepository.deleteById(commentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{commentId}/pin")
    public ResponseEntity<Comment> togglePinComment(@PathVariable Long commentId, @RequestParam String username) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (commentOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Comment comment = commentOptional.get();
        if (!comment.getReel().getUser().getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        comment.setPinned(!comment.isPinned());
        Comment updatedComment = commentRepository.save(comment);
        return ResponseEntity.ok(updatedComment);
    }
    @PostMapping("/{commentId}/like")
    public ResponseEntity<Comment> likeComment(@PathVariable Long commentId, @RequestParam String username) {
        try {
            Comment likedComment = commentService.likeComment(commentId, username);
            return ResponseEntity.ok(likedComment);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @DeleteMapping("/{commentId}/like")
    public ResponseEntity<Comment> unlikeComment(@PathVariable Long commentId, @RequestParam String username) {
        try {
            Comment unlikedComment = commentService.unlikeComment(commentId, username);
            return ResponseEntity.ok(unlikedComment);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/liked/{username}")
    public ResponseEntity<Set<Long>> getLikedCommentIds(@PathVariable String username) {
        try {
            Set<Long> likedIds = commentService.getLikedCommentIdsByUsername(username);
            return ResponseEntity.ok(likedIds);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

