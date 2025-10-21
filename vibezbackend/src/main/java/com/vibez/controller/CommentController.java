package com.vibez.controller;

import com.vibez.dto.UpdateCommentRequest;
import com.vibez.model.Comment;
import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.repository.CommentRepository;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ReelRepository reelRepository;

    public CommentController(CommentRepository commentRepository, UserRepository userRepository, ReelRepository reelRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.reelRepository = reelRepository;
    }

    @PostMapping
    public ResponseEntity<Comment> addComment(@RequestParam String text, @RequestParam Long reelId, @RequestParam String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        Optional<Reel> reelOptional = reelRepository.findById(reelId);

        if (userOptional.isEmpty() || reelOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Comment newComment = new Comment();
        newComment.setText(text);
        newComment.setUser(userOptional.get());
        newComment.setReel(reelOptional.get());

        Comment savedComment = commentRepository.save(newComment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
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
}

