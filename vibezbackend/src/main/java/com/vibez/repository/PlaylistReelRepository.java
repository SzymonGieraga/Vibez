package com.vibez.repository;

import com.vibez.model.Playlist;
import com.vibez.model.PlaylistReel;
import com.vibez.model.Reel;
import com.vibez.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistReelRepository extends JpaRepository<PlaylistReel, Long> {

    boolean existsByPlaylistAndReel(Playlist playlist, Reel reel);

    Optional<PlaylistReel> findByPlaylistAndReel(Playlist playlist, Reel reel);

    void deleteByPlaylistAndReel(Playlist playlist, Reel reel);

    List<PlaylistReel> findByPlaylist_Owner(User user);

    List<PlaylistReel> findByReel(Reel reel);
}