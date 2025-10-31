package com.vibez.service;

import com.vibez.model.*;
import com.vibez.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReelService {

    private final ReelRepository reelRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final PlaylistReelRepository playlistReelRepository;

    public ReelService(ReelRepository reelRepository, UserRepository userRepository, LikeRepository likeRepository, PlaylistReelRepository playlistReelRepository) {
        this.reelRepository = reelRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
        this.playlistReelRepository = playlistReelRepository;
    }

    @Transactional
    public Reel likeReel(Long reelId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new EntityNotFoundException("Reel not found: " + reelId));

        if (likeRepository.existsByUserAndReel(user, reel)) {
            return reel;
        }

        Like newLike = new Like(user, reel);

        try {
            likeRepository.save(newLike);

            reel.incrementLikeCount();
            return reelRepository.save(reel);

        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Like operation failed due to concurrent modification.", e);
        }
    }

    @Transactional
    public Reel unlikeReel(Long reelId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new EntityNotFoundException("Reel not found: " + reelId));

        Like like = likeRepository.findByUserAndReel(user, reel)
                .orElseThrow(() -> new EntityNotFoundException("Like not found"));

        likeRepository.delete(like);

        reel.decrementLikeCount();
        return reelRepository.save(reel);
    }

    @Transactional(readOnly = true)
    public List<Reel> getLikedReelsByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        List<Like> sortedLikes = likeRepository.findByUserOrderByCreatedAtDesc(user);

        return sortedLikes.stream()
                .map(Like::getReel)
                .collect(Collectors.toList());
    }
    public List<Reel> getAllReelsWithTopLevelComments() {
        List<Reel> reels = reelRepository.findAllByOrderByIdDesc();

        for (Reel reel : reels) {
            if (reel.getComments() != null) {
                Map<Long, Comment> uniqueComments = new LinkedHashMap<>();

                for (Comment comment : reel.getComments()) {
                    if (comment.getParentComment() == null) {
                        uniqueComments.putIfAbsent(comment.getId(), comment);
                    }
                }

                List<Comment> topLevel = new ArrayList<>(uniqueComments.values());

                System.out.println("Reel " + reel.getId() + ": " +
                        reel.getComments().size() + " total -> " +
                        topLevel.size() + " unique top-level");

                reel.setComments(topLevel);
            }
        }

        return reels;
    }

    public List<Reel> getReelsByUserWithTopLevelComments(User user) {
        List<Reel> reels = reelRepository.findByUser(user);

        reels.forEach(reel -> {
            List<Comment> topLevelComments = reel.getComments().stream()
                    .filter(comment -> comment.getParentComment() == null)
                    .collect(Collectors.toList());
            reel.setComments(topLevelComments);
        });

        return reels;
    }
    @Transactional(readOnly = true)
    public List<String> getPlaylistsForReel(Long reelId, String requestingUsername) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new EntityNotFoundException("Reel not found: " + reelId));

        User requestingUser = userRepository.findByUsername(requestingUsername)
                .orElse(null);

        List<PlaylistReel> entries = playlistReelRepository.findByReel(reel);

        return entries.stream()
                .map(PlaylistReel::getPlaylist)
                .filter(playlist -> {
                    if (playlist.isPublic()) return true;
                    return requestingUser != null && playlist.getOwner().equals(requestingUser);
                })
                .map(Playlist::getName)
                .distinct()
                .collect(Collectors.toList());
    }
}