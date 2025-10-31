package com.vibez.controller;

import com.vibez.model.Playlist;
import com.vibez.model.PlaylistReel;
import com.vibez.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    @PostMapping
    public ResponseEntity<Playlist> createPlaylist(
            @RequestParam String username,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(defaultValue = "true") boolean isPublic
    ) {
        Playlist playlist = playlistService.createPlaylist(username, name, description, isPublic);
        return ResponseEntity.ok(playlist);
    }

    @PutMapping("/{playlistId}")
    public ResponseEntity<Playlist> updatePlaylist(
            @PathVariable Long playlistId,
            @RequestParam String username,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Boolean isPublic
    ) {
        Playlist playlist = playlistService.updatePlaylist(playlistId, username, name, description, isPublic);
        return ResponseEntity.ok(playlist);
    }

    @DeleteMapping("/{playlistId}")
    public ResponseEntity<Void> deletePlaylist(
            @PathVariable Long playlistId,
            @RequestParam String username
    ) {
        playlistService.deletePlaylist(playlistId, username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{playlistId}/reels/{reelId}")
    public ResponseEntity<PlaylistReel> addReelToPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long reelId,
            @RequestParam String username
    ) {
        PlaylistReel playlistReel = playlistService.addReelToPlaylist(playlistId, reelId, username);
        return ResponseEntity.ok(playlistReel);
    }

    @DeleteMapping("/{playlistId}/reels/{reelId}")
    public ResponseEntity<Void> removeReelFromPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long reelId,
            @RequestParam String username
    ) {
        playlistService.removeReelFromPlaylist(playlistId, reelId, username);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<Playlist>> getUserPlaylists(
            @PathVariable String username,
            @RequestParam String requestingUsername
    ) {
        List<Playlist> playlists = playlistService.getUserPlaylists(username, requestingUsername);
        return ResponseEntity.ok(playlists);
    }

    @GetMapping("/{playlistId}")
    public ResponseEntity<Playlist> getPlaylist(
            @PathVariable Long playlistId,
            @RequestParam String requestingUsername
    ) {
        Playlist playlist = playlistService.getPlaylist(playlistId, requestingUsername);
        return ResponseEntity.ok(playlist);
    }

    @GetMapping("/public")
    public ResponseEntity<List<Playlist>> getAllPublicPlaylists() {
        List<Playlist> playlists = playlistService.getAllPublicPlaylists();
        return ResponseEntity.ok(playlists);
    }
    @GetMapping("/saved-reels/{username}")
    public ResponseEntity<Set<Long>> getSavedReelIds(@PathVariable String username) {
        Set<Long> reelIds = playlistService.getSavedReelIds(username);
        return ResponseEntity.ok(reelIds);
    }
}