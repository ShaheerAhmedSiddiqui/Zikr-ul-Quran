package com.zikrulquran.repository;

import com.zikrulquran.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    // Changed Long userId to Integer userId to match User model
    List<Playlist> findByUserUserId(Integer userId);

    List<Playlist> findByUserUsername(String username);

    // Changed Long userId to Integer userId to match User model
    Optional<Playlist> findByPlaylistIdAndUserUserId(Long playlistId, Integer userId);

    // NEW: Search playlists by name for a specific user
    List<Playlist> findByUserUserIdAndPlaylistNameContainingIgnoreCase(Integer userId, String name);

    // NEW: Check if playlist exists for user
    Boolean existsByPlaylistIdAndUserUserId(Long playlistId, Integer userId);

    // NEW: Count playlists by user
    Integer countByUserUserId(Integer userId);

    // NEW: Find playlist with items eagerly loaded
    @Query("SELECT p FROM Playlist p LEFT JOIN FETCH p.items WHERE p.playlistId = :playlistId AND p.user.userId = :userId")
    Optional<Playlist> findByIdAndUserIdWithItems(@Param("playlistId") Long playlistId, @Param("userId") Integer userId);
}