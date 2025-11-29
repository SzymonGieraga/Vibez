package com.vibez.service;

import com.vibez.model.Comment;
import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final UserRepository userRepository;
    private final ReelRepository reelRepository;

    public SearchService(UserRepository userRepository, ReelRepository reelRepository) {
        this.userRepository = userRepository;
        this.reelRepository = reelRepository;
    }

    @Transactional(readOnly = true)
    public List<User> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    @Transactional(readOnly = true)
    public List<Reel> searchReelsByDescription(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        List<Reel> rawReels = reelRepository.findByDescriptionContainingIgnoreCase(query);
        return processReels(rawReels);
    }

    @Transactional(readOnly = true)
    public List<Reel> searchReelsByTag(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String cleanQuery = query.startsWith("#") ? query.substring(1) : query;

        List<Reel> rawReels = reelRepository.findByTags_NameContainingIgnoreCase(cleanQuery);
        return processReels(rawReels);
    }
    private List<Reel> processReels(List<Reel> rawReels) {
       Set<Reel> uniqueReelsSet = new LinkedHashSet<>(rawReels);
        uniqueReelsSet.forEach(this::filterTopLevelComments);
        return new ArrayList<>(uniqueReelsSet);
    }

    private void filterTopLevelComments(Reel reel) {
        if (reel.getComments() == null || reel.getComments().isEmpty()) {
            return;
        }
        Map<Long, Comment> uniqueComments = new LinkedHashMap<>();

        for (Comment comment : reel.getComments()) {
            if (comment.getParentComment() == null) {
                uniqueComments.putIfAbsent(comment.getId(), comment);
            }
        }
        reel.setComments(new ArrayList<>(uniqueComments.values()));
    }
}