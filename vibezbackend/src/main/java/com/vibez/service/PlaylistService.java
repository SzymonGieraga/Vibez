package com.vibez.service;

import com.vibez.model.Playlist;
import com.vibez.model.PlaylistReel;
import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.repository.PlaylistReelRepository;
import com.vibez.repository.PlaylistRepository;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistReelRepository playlistReelRepository;
    private final UserRepository userRepository;
    private final ReelRepository reelRepository;

    @Transactional
    public Playlist createPlaylist(String username, String name, String description, boolean isPublic) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        Playlist playlist = new Playlist(name, user);
        playlist.setDescription(description);
        playlist.setPublic(isPublic);

        Playlist saved = playlistRepository.save(playlist);
        log.info("Created playlist '{}' for user {}", name, username);

        return saved;
    }

    @Transactional
    public Playlist updatePlaylist(Long playlistId, String username, String name, String description, Boolean isPublic) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        Playlist playlist = playlistRepository.findByIdAndOwner(playlistId, user)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found or you don't have permission"));

        if (name != null) playlist.setName(name);
        if (description != null) playlist.setDescription(description);
        if (isPublic != null) playlist.setPublic(isPublic);

        return playlistRepository.save(playlist);
    }

    @Transactional
    public void deletePlaylist(Long playlistId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        Playlist playlist = playlistRepository.findByIdAndOwner(playlistId, user)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found or you don't have permission"));

        playlistRepository.delete(playlist);
        log.info("Deleted playlist {} by user {}", playlistId, username);
    }

    @Transactional
    public PlaylistReel addReelToPlaylist(Long playlistId, Long reelId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        Playlist playlist = playlistRepository.findByIdAndOwner(playlistId, user)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found or you don't have permission"));

        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new EntityNotFoundException("Reel not found: " + reelId));

        if (playlistReelRepository.existsByPlaylistAndReel(playlist, reel)) {
            throw new IllegalStateException("Reel already in playlist");
        }

        PlaylistReel playlistReel = new PlaylistReel(playlist, reel);
        PlaylistReel saved = playlistReelRepository.save(playlistReel);

        log.info("Added reel {} to playlist {} by user {}", reelId, playlistId, username);

        return saved;
    }

    @Transactional
    public void removeReelFromPlaylist(Long playlistId, Long reelId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        Playlist playlist = playlistRepository.findByIdAndOwner(playlistId, user)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found or you don't have permission"));

        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new EntityNotFoundException("Reel not found: " + reelId));

        playlistReelRepository.deleteByPlaylistAndReel(playlist, reel);
        log.info("Removed reel {} from playlist {} by user {}", reelId, playlistId, username);
    }

    @Transactional(readOnly = true)
    public List<Playlist> getUserPlaylists(String username, String requestingUsername) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        if (username.equals(requestingUsername)) {
            return playlistRepository.findByOwnerOrderByCreatedAtDesc(user);
        }

        return playlistRepository.findPublicPlaylistsByUsername(username);
    }

    @Transactional(readOnly = true)
    public Playlist getPlaylist(Long playlistId, String requestingUsername) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found: " + playlistId));

        if (!playlist.isPublic() && !playlist.getOwner().getUsername().equals(requestingUsername)) {
            throw new SecurityException("This playlist is private");
        }

        return playlist;
    }

    @Transactional(readOnly = true)
    public List<Playlist> getAllPublicPlaylists() {
        return playlistRepository.findByIsPublicTrueOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Set<Long> getSavedReelIds(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        List<PlaylistReel> savedEntries = playlistReelRepository.findByPlaylist_Owner(user);

        return savedEntries.stream()
                .map(playlistReel -> playlistReel.getReel().getId())
                .collect(Collectors.toSet());
    }

}