package com.zikrulquran.repository;

import com.zikrulquran.model.PlaylistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistItemRepository extends JpaRepository<PlaylistItem, Long> {

    List<PlaylistItem> findByPlaylistPlaylistId(Long playlistId);

    List<PlaylistItem> findByPlaylistPlaylistIdOrderByPosition(Long playlistId);

    Optional<PlaylistItem> findByPlaylistPlaylistIdAndSurahSurahId(Long playlistId, Integer surahId);

    // Add this method to your existing PlaylistItemRepository.java
    Optional<PlaylistItem> findByPlaylistPlaylistIdAndSurahSurahIdAndLanguage(Long playlistId, Integer surahId, String language);

    void deleteByPlaylistPlaylistIdAndSurahSurahId(Long playlistId, Integer surahId);

    Integer countByPlaylistPlaylistId(Long playlistId);

    // NEW: Find items within position range (for reordering)
    List<PlaylistItem> findByPlaylistPlaylistIdAndPositionBetween(Long playlistId, Integer startPosition, Integer endPosition);

    // NEW: Find item by playlist and position
    Optional<PlaylistItem> findByPlaylistPlaylistIdAndPosition(Long playlistId, Integer position);

    // NEW: Update positions for reordering
    @Modifying
    @Transactional
    @Query("UPDATE PlaylistItem pi SET pi.position = pi.position + :increment WHERE pi.playlist.playlistId = :playlistId AND pi.position >= :startPosition")
    void incrementPositions(@Param("playlistId") Long playlistId,
                            @Param("startPosition") Integer startPosition,
                            @Param("increment") Integer increment);

    // NEW: Get max position in playlist
    @Query("SELECT COALESCE(MAX(pi.position), -1) FROM PlaylistItem pi WHERE pi.playlist.playlistId = :playlistId")
    Integer findMaxPositionByPlaylistId(@Param("playlistId") Long playlistId);
}