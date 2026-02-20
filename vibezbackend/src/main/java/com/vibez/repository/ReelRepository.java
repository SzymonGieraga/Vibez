package com.vibez.repository;

import com.vibez.model.Reel;
import com.vibez.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReelRepository extends JpaRepository<Reel, Long> {

    @Override
    @EntityGraph(attributePaths = {
            "user",
            "tags"})
    Page<Reel> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {
            "user",
            "tags"})
    Optional<Reel> findById(Long id);

    @EntityGraph(attributePaths = {
            "user",
            "comments",
            "comments.user",
            "comments.replies",
            "comments.replies.user",
            "tags"})
    List<Reel> findByUser(User user);

    @EntityGraph(attributePaths = {
            "user",
            "comments",
            "comments.user",
            "comments.replies",
            "comments.replies.user",
            "tags"})
    List<Reel> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {
            "user",
            "comments",
            "comments.user",
            "comments.replies",
            "comments.replies.user",
            "tags"})
    List<Reel> findByUserInOrderByIdDesc(List<User> users);

    @EntityGraph(attributePaths = {
            "user",
            "comments",
            "comments.user",
            "comments.replies",
            "comments.replies.user",
            "tags"})
    List<Reel> findTop50ByOrderByLikeCountDesc();

    List<Reel> findByDescriptionContainingIgnoreCase(String description);

    List<Reel> findByTags_NameContainingIgnoreCase(String tagName);
}