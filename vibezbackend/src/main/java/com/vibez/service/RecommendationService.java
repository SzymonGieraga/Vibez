package com.vibez.service;

import com.vibez.model.*;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ReelRepository reelRepository;
    private final UserRepository userRepository;

    public RecommendationService(ReelRepository reelRepository, UserRepository userRepository) {
        this.reelRepository = reelRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Reel> getRecommendedReelsForUser(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return reelRepository.findAll();
        }

        User user = userOpt.get();
        Set<Like> userLikes = user.getLikes();
        Set<Follow> userFollowing = user.getFollowing();
        Set<Long> likedReelIds = userLikes.stream()
                .map(like -> like.getReel().getId())
                .collect(Collectors.toSet());

        Set<Long> followingUserIds = userFollowing.stream()
                .map(follow -> follow.getFollowing().getId())
                .collect(Collectors.toSet());

        Map<String, Integer> tagScores = new HashMap<>();
        Map<String, Integer> genreScores = new HashMap<>();

        for (Like like : userLikes) {
            Reel reel = like.getReel();

            if (reel.getGenre() != null) {
                genreScores.merge(reel.getGenre(), 1, Integer::sum);
            }

            for (Tag tag : reel.getTags()) {
                tagScores.merge(tag.getName(), 1, Integer::sum);
            }
        }

        List<Reel> allReels = reelRepository.findAll();

        return allReels.stream()
                .filter(reel -> !likedReelIds.contains(reel.getId()))
                .sorted((r1, r2) -> {
                    double score1 = calculateScore(r1, tagScores, genreScores, followingUserIds);
                    double score2 = calculateScore(r2, tagScores, genreScores, followingUserIds);
                    return Double.compare(score2, score1);
                })
                .collect(Collectors.toList());
    }


    private double calculateScore(Reel reel, Map<String, Integer> tagScores, Map<String, Integer> genreScores, Set<Long> followingUserIds) {
        double score = 0;

        if (followingUserIds.contains(reel.getUser().getId())) {
            score += 5.0;
        }

        if (reel.getGenre() != null) {
            score += genreScores.getOrDefault(reel.getGenre(), 0) * 2.0;
        }

        for (Tag tag : reel.getTags()) {
            score += tagScores.getOrDefault(tag.getName(), 0) * 3.0;
        }

        score += reel.getLikeCount() * 0.1;

        return score;
    }
}