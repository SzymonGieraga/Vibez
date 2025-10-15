package com.vibez.repository;

import com.vibez.model.Reel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReelRepository extends JpaRepository<Reel, Long> {
    List<Reel> findByUsername(String username);
}