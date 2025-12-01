package com.vibez.repository;

import com.vibez.model.ReelPreview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReelPreviewRepository extends JpaRepository<ReelPreview, Long> {
    Optional<ReelPreview> findByReelId(Long reelId);
}