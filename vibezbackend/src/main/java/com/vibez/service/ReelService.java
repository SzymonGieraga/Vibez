package com.vibez.service;

import com.vibez.model.Like;
import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.repository.LikeRepository;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReelService {

    private final ReelRepository reelRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    public ReelService(ReelRepository reelRepository, UserRepository userRepository, LikeRepository likeRepository) {
        this.reelRepository = reelRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
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
}