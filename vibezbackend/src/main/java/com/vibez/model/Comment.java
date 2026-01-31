package com.vibez.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String text;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastModifiedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;
    private boolean isPinned = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"comments", "reels", "likedReels", "likedComments", "bio", "email"})
    private User user;

    @Column(nullable = false)
    private boolean isBanned = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reel_id", nullable = false)
    @JsonBackReference
    private Reel reel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @JsonBackReference
    private Comment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Set<Comment> replies = new HashSet<>();

    private int likeCount = 0;

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<CommentLike> likes = new HashSet<>();

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getText() {return text;}
    public void setText(String text) {this.text = text;}
    public LocalDateTime getCreatedAt() {return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
    public boolean isPinned() {return isPinned;}
    public void setPinned(boolean pinned) {isPinned = pinned;}
    public User getUser() {return user;}
    public void setUser(User user) {this.user = user;}
    public void setBanned(boolean banned) {isBanned = banned;}
    public boolean isBanned() {return isBanned;}
    public Reel getReel() {return reel;}
    public void setReel(Reel reel) {this.reel = reel;}
    public Comment getParentComment() {return parentComment;}
    public void setParentComment(Comment parentComment) {this.parentComment = parentComment;}
    public Set<Comment> getReplies() {return replies;}
    public void setReplies(Set<Comment> replies) {this.replies = replies;}
    public int getLikeCount() {return likeCount;}
    public void setLikeCount(int likeCount) {this.likeCount = likeCount;}

    public Set<CommentLike> getLikes() { return likes; }
    public void setLikes(Set<CommentLike> likes) { this.likes = likes; }

    public void incrementLikeCount() {
        this.likeCount++;
    }

    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }
}

