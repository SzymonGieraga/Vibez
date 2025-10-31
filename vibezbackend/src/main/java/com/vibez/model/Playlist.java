package com.vibez.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "playlists")
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"playlists", "reels", "email", "bio", "likes"})
    private User owner;

    @Column(nullable = false)
    private boolean isPublic = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("addedAt DESC")
    @JsonIgnoreProperties("playlist")
    private List<PlaylistReel> playlistReels = new ArrayList<>();

    @Transient
    private String thumbnailUrl;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Playlist() {}

    public Playlist(String name, User owner) {
        this.name = name;
        this.owner = owner;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean aPublic) { isPublic = aPublic; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<PlaylistReel> getPlaylistReels() { return playlistReels; }
    public void setPlaylistReels(List<PlaylistReel> playlistReels) { this.playlistReels = playlistReels; }

    public String getThumbnailUrl() {
        if (playlistReels != null && !playlistReels.isEmpty()) {
            return playlistReels.get(0).getReel().getThumbnailUrl();
        }
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public int getReelCount() {
        return playlistReels != null ? playlistReels.size() : 0;
    }

    public String getOwnerUsername() {
        return owner != null ? owner.getUsername() : null;
    }
}