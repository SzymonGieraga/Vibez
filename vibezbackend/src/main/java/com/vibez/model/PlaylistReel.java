package com.vibez.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "playlist_reels",
        uniqueConstraints = @UniqueConstraint(columnNames = {"playlist_id", "reel_id"}))
public class PlaylistReel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    @JsonIgnoreProperties({"playlistReels", "owner"})
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reel_id", nullable = false)
    @JsonIgnoreProperties({"comments", "likes", "user"})
    private Reel reel;

    @Column(nullable = false, updatable = false)
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }

    public PlaylistReel() {}

    public PlaylistReel(Playlist playlist, Reel reel) {
        this.playlist = playlist;
        this.reel = reel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Playlist getPlaylist() { return playlist; }
    public void setPlaylist(Playlist playlist) { this.playlist = playlist; }

    public Reel getReel() { return reel; }
    public void setReel(Reel reel) { this.reel = reel; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}