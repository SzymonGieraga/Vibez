package com.vibez.repository;

import com.vibez.model.Like;
import com.vibez.model.Reel;
import com.vibez.model.User;
import org.springframework.data.jpa.repository.EntityGraph; // 1. IMPORTUJ
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserAndReel(User user, Reel reel);

    boolean existsByUserAndReel(User user, Reel reel);

    @EntityGraph(attributePaths = {"reel"})
    List<Like> findByUserOrderByCreatedAtDesc(User user);
}