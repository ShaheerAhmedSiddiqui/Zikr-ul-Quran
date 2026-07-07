package com.zikrulquran.service;

import com.zikrulquran.model.Playlist;
import com.zikrulquran.model.PlaylistItem;
import com.zikrulquran.model.Surah;
import com.zikrulquran.model.User;
import com.zikrulquran.repository.PlaylistRepository;
import com.zikrulquran.repository.PlaylistItemRepository;
import com.zikrulquran.repository.SurahRepository;
import com.zikrulquran.repository.UserRepository;
import com.zikrulquran.util.PlaylistLinkedList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PlaylistService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private PlaylistItemRepository playlistItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SurahRepository surahRepository;

    // Create new playlist
    public Playlist createPlaylist(String playlistName, Integer userId) {
        if (playlistName == null || playlistName.trim().isEmpty()) {
            throw new IllegalArgumentException("Playlist name cannot be empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Playlist playlist = new Playlist(playlistName, user);
        return playlistRepository.save(playlist);
    }

    // Get user's playlists - FIXED: Eagerly load items with surahs
    // Get user's playlists - FIXED: Ensure items are properly loaded and counted
    public List<Playlist> getUserPlaylists(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        try {
            // Use JPQL with JOIN FETCH to eagerly load items and surahs
            String jpql = "SELECT DISTINCT p FROM Playlist p " +
                    "LEFT JOIN FETCH p.items i " +
                    "LEFT JOIN FETCH i.surah " +
                    "WHERE p.user.userId = :userId " +
                    "ORDER BY p.playlistName";

            List<Playlist> playlists = entityManager.createQuery(jpql, Playlist.class)
                    .setParameter("userId", userId)
                    .getResultList();

            System.out.println("🔍 Loaded " + playlists.size() + " playlists with JOIN FETCH");
            for (Playlist playlist : playlists) {
                System.out.println("📊 Playlist: " + playlist.getPlaylistName() +
                        ", Items count: " + (playlist.getItems() != null ? playlist.getItems().size() : 0) +
                        ", ItemCount property: " + playlist.getItemCount());
            }

            return playlists;
        } catch (Exception e) {
            System.err.println("❌ Error with JOIN FETCH, falling back to repository: " + e.getMessage());
            // Fallback to repository method and manually load items
            List<Playlist> playlists = playlistRepository.findByUserUserId(userId);

            // Manually load items for each playlist with surahs
            for (Playlist playlist : playlists) {
                List<PlaylistItem> items = playlistItemRepository.findByPlaylistPlaylistIdOrderByPosition(playlist.getPlaylistId());
                // Initialize the surah for each item to avoid LazyInitializationException
                for (PlaylistItem item : items) {
                    if (item.getSurah() != null) {
                        item.getSurah().getSurahNameEn(); // Trigger lazy loading
                    }
                }
                playlist.setItems(items);

                System.out.println("🔄 Manual load - Playlist: " + playlist.getPlaylistName() +
                        ", Items count: " + items.size() +
                        ", ItemCount property: " + playlist.getItemCount());
            }

            System.out.println("🔄 Loaded " + playlists.size() + " playlists with manual loading");
            return playlists;
        }
    }

    // Get playlist by ID with user validation - FIXED: Eagerly load items
    public Optional<Playlist> getPlaylistByIdAndUserId(Long playlistId, Integer userId) {
        if (playlistId == null || userId == null) {
            throw new IllegalArgumentException("Playlist ID and User ID cannot be null");
        }

        try {
            String jpql = "SELECT p FROM Playlist p " +
                    "LEFT JOIN FETCH p.items i " +
                    "LEFT JOIN FETCH i.surah " +
                    "WHERE p.playlistId = :playlistId AND p.user.userId = :userId";

            Playlist playlist = entityManager.createQuery(jpql, Playlist.class)
                    .setParameter("playlistId", playlistId)
                    .setParameter("userId", userId)
                    .getSingleResult();

            return Optional.of(playlist);
        } catch (Exception e) {
            System.err.println("❌ Error with JOIN FETCH for single playlist, falling back: " + e.getMessage());
            // Fallback to repository method
            Optional<Playlist> playlistOpt = playlistRepository.findByPlaylistIdAndUserUserId(playlistId, userId);
            if (playlistOpt.isPresent()) {
                Playlist playlist = playlistOpt.get();
                List<PlaylistItem> items = playlistItemRepository.findByPlaylistPlaylistIdOrderByPosition(playlistId);
                // Initialize surahs
                for (PlaylistItem item : items) {
                    if (item.getSurah() != null) {
                        item.getSurah().getSurahNameEn(); // Trigger lazy loading
                    }
                }
                playlist.setItems(items);
            }
            return playlistOpt;
        }
    }

    // Delete playlist with user validation
    public void deletePlaylist(Long playlistId, Integer userId) {
        if (playlistId == null || userId == null) {
            throw new IllegalArgumentException("Playlist ID and User ID cannot be null");
        }

        Playlist playlist = playlistRepository.findByPlaylistIdAndUserUserId(playlistId, userId)
                .orElseThrow(() -> new RuntimeException("Playlist not found or access denied"));

        playlistRepository.delete(playlist);
    }

    // Add surah to playlist - UPDATED: Now includes language parameter
    public PlaylistItem addSurahToPlaylist(Long playlistId, Integer surahId, Integer userId, String language) {
        if (playlistId == null || surahId == null || userId == null || language == null) {
            throw new IllegalArgumentException("Playlist ID, Surah ID, User ID, and Language cannot be null");
        }

        // Verify user owns the playlist
        Playlist playlist = playlistRepository.findByPlaylistIdAndUserUserId(playlistId, userId)
                .orElseThrow(() -> new RuntimeException("Playlist not found or access denied"));

        // Verify surah exists
        Surah surah = surahRepository.findById(surahId)
                .orElseThrow(() -> new RuntimeException("Surah not found with ID: " + surahId));

        // Validate language
        if (!isValidLanguage(language)) {
            throw new RuntimeException("Invalid language: " + language + ". Supported languages: arabic, english, urdu");
        }

        // Check if surah with same language already exists in playlist
        Optional<PlaylistItem> existingItem = playlistItemRepository.findByPlaylistPlaylistIdAndSurahSurahIdAndLanguage(playlistId, surahId, language);
        if (existingItem.isPresent()) {
            throw new RuntimeException("Surah " + surah.getSurahNameEn() + " in " + language + " already exists in this playlist");
        }

        // Get next available position
        Integer maxPosition = playlistItemRepository.findMaxPositionByPlaylistId(playlistId);
        int position = (maxPosition != null && maxPosition >= 0) ? maxPosition + 1 : 1;

        // Create new playlist item using entity relationships
        PlaylistItem newItem = new PlaylistItem(playlist, surah, language, position);
        PlaylistItem savedItem = playlistItemRepository.save(newItem);

        System.out.println("✅ Successfully added surah " + surahId + " to playlist " + playlistId +
                " in language " + language + " at position " + position);

        return savedItem;
    }

    // Remove surah from playlist - UPDATED: Now includes language
    public void removeSurahFromPlaylist(Long playlistId, Integer surahId, Integer userId, String language) {
        if (playlistId == null || surahId == null || userId == null || language == null) {
            throw new IllegalArgumentException("Playlist ID, Surah ID, User ID, and Language cannot be null");
        }

        // Verify user owns the playlist
        if (!playlistRepository.existsByPlaylistIdAndUserUserId(playlistId, userId)) {
            throw new RuntimeException("Playlist not found or access denied");
        }

        PlaylistItem item = playlistItemRepository.findByPlaylistPlaylistIdAndSurahSurahIdAndLanguage(playlistId, surahId, language)
                .orElseThrow(() -> new RuntimeException("Surah not found in playlist with the specified language"));

        playlistItemRepository.delete(item);

        // Reorder remaining items efficiently
        reorderPlaylistItems(playlistId);
    }

    // Get playlist as LinkedList (DSA Implementation)
    public PlaylistLinkedList getPlaylistAsLinkedList(Long playlistId) {
        if (playlistId == null) {
            throw new IllegalArgumentException("Playlist ID cannot be null");
        }

        List<PlaylistItem> items = playlistItemRepository.findByPlaylistPlaylistIdOrderByPosition(playlistId);

        PlaylistLinkedList linkedList = new PlaylistLinkedList();
        for (PlaylistItem item : items) {
            linkedList.add(item);
        }

        return linkedList;
    }

    // Get next surah in playlist (for audio player)
    public Optional<PlaylistItem> getNextSurah(Long playlistId, int currentPosition) {
        if (playlistId == null) {
            throw new IllegalArgumentException("Playlist ID cannot be null");
        }

        PlaylistLinkedList linkedList = getPlaylistAsLinkedList(playlistId);

        if (currentPosition < 0 || currentPosition >= linkedList.size() - 1) {
            return Optional.empty();
        }

        return Optional.of(linkedList.get(currentPosition + 1));
    }

    // Get previous surah in playlist (for audio player)
    public Optional<PlaylistItem> getPreviousSurah(Long playlistId, int currentPosition) {
        if (playlistId == null) {
            throw new IllegalArgumentException("Playlist ID cannot be null");
        }

        PlaylistLinkedList linkedList = getPlaylistAsLinkedList(playlistId);

        if (currentPosition <= 0 || currentPosition >= linkedList.size()) {
            return Optional.empty();
        }

        return Optional.of(linkedList.get(currentPosition - 1));
    }

    // Get playlist items as list
    public List<PlaylistItem> getPlaylistItems(Long playlistId) {
        if (playlistId == null) {
            throw new IllegalArgumentException("Playlist ID cannot be null");
        }
        return playlistItemRepository.findByPlaylistPlaylistIdOrderByPosition(playlistId);
    }

    // 🎯 Get playlist item count using your repository method
    public int getPlaylistItemCount(Long playlistId) {
        if (playlistId == null) {
            throw new IllegalArgumentException("Playlist ID cannot be null");
        }
        Integer count = playlistItemRepository.countByPlaylistPlaylistId(playlistId);
        return count != null ? count : 0;
    }

    // Helper method to reorder playlist items after deletion (Efficient version)
    private void reorderPlaylistItems(Long playlistId) {
        List<PlaylistItem> items = playlistItemRepository.findByPlaylistPlaylistIdOrderByPosition(playlistId);

        for (int i = 0; i < items.size(); i++) {
            items.get(i).setPosition(i + 1); // Start from 1 instead of 0
        }

        // Save all at once
        playlistItemRepository.saveAll(items);
    }

    // 🎯 NEW: Check if playlist has any items
    public boolean hasItems(Long playlistId) {
        return getPlaylistItemCount(playlistId) > 0;
    }

    // 🎯 NEW: Validate language
    private boolean isValidLanguage(String language) {
        return language != null &&
                (language.equals("arabic") || language.equals("english") || language.equals("urdu"));
    }
}