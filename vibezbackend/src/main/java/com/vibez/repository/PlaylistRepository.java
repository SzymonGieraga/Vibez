package com.vibez.repository;

import com.vibez.model.Playlist;
import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.model.PlaylistReel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByOwnerOrderByCreatedAtDesc(User owner);

    List<Playlist> findByIsPublicTrueOrderByCreatedAtDesc();

    @Query("SELECT p FROM Playlist p WHERE p.owner.username = :username ORDER BY p.createdAt DESC")
    List<Playlist> findByOwnerUsername(@Param("username") String username);

    @Query("SELECT p FROM Playlist p WHERE p.owner.username = :username AND p.isPublic = true ORDER BY p.createdAt DESC")
    List<Playlist> findPublicPlaylistsByUsername(@Param("username") String username);

    Optional<Playlist> findByIdAndOwner(Long id, User owner);


}