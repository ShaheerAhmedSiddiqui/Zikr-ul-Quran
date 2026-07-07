package com.zikrulquran.controller;

import com.zikrulquran.model.Playlist;
import com.zikrulquran.model.PlaylistItem;
import com.zikrulquran.service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/playlists")
@CrossOrigin(origins = "http://localhost:3000")
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    // Create new playlist
    @PostMapping
    public ResponseEntity<?> createPlaylist(@RequestBody Map<String, String> request) {
        try {
            String playlistName = request.get("playlistName");
            Integer userId = Integer.parseInt(request.get("userId"));

            if (playlistName == null || playlistName.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Playlist name is required");
                return ResponseEntity.badRequest().body(error);
            }

            Playlist playlist = playlistService.createPlaylist(playlistName, userId);

            // Return DTO with proper structure
            Map<String, Object> response = createPlaylistDTO(playlist);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get user's playlists - FIXED VERSION
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPlaylists(@PathVariable Integer userId) {
        try {
            List<Playlist> playlists = playlistService.getUserPlaylists(userId);

            // Convert to DTO with proper serialization
            List<Map<String, Object>> playlistDTOs = playlists.stream()
                    .map(this::createPlaylistDTO)
                    .collect(Collectors.toList());

            System.out.println("🎯 Sending " + playlistDTOs.size() + " playlists to frontend");
            for (Map<String, Object> dto : playlistDTOs) {
                System.out.println("📝 Playlist: " + dto.get("playlistName") +
                        ", Frontend Count: " + dto.get("itemCount") +
                        ", Actual Items: " + ((List<?>) dto.get("items")).size());
            }

            return ResponseEntity.ok(playlistDTOs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Delete playlist
    @DeleteMapping("/{playlistId}")
    public ResponseEntity<?> deletePlaylist(
            @PathVariable Long playlistId,
            @RequestParam Integer userId) {

        try {
            playlistService.deletePlaylist(playlistId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Playlist deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Add surah to playlist - UPDATED: Now includes language parameter
    @PostMapping("/{playlistId}/surahs/{surahId}")
    public ResponseEntity<?> addSurahToPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Integer surahId,
            @RequestParam Integer userId,
            @RequestParam String language) {

        try {
            System.out.println("🎵 Adding surah " + surahId + " to playlist " + playlistId +
                    " for user " + userId + " in language: " + language);

            PlaylistItem item = playlistService.addSurahToPlaylist(playlistId, surahId, userId, language);

            // Return simplified response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Surah added to playlist successfully");
            response.put("itemId", item.getItemId());
            response.put("surahId", item.getSurahId());
            response.put("language", item.getLanguage());
            response.put("position", item.getPosition());
            response.put("playlistId", playlistId);

            System.out.println("✅ Successfully added surah to playlist in language: " + language);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            System.err.println("❌ Error adding surah to playlist: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error adding surah to playlist: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Remove surah from playlist - UPDATED: Now includes language
    @DeleteMapping("/{playlistId}/surahs/{surahId}")
    public ResponseEntity<?> removeSurahFromPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Integer surahId,
            @RequestParam Integer userId,
            @RequestParam String language) {

        try {
            playlistService.removeSurahFromPlaylist(playlistId, surahId, userId, language);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Surah removed from playlist");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get playlist items (for audio player)
    @GetMapping("/{playlistId}/items")
    public ResponseEntity<?> getPlaylistItems(@PathVariable Long playlistId) {
        try {
            List<PlaylistItem> items = playlistService.getPlaylistItems(playlistId);

            // Convert to DTO
            List<Map<String, Object>> itemDTOs = items.stream().map(item -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("itemId", item.getItemId());
                dto.put("surahId", item.getSurahId());
                dto.put("language", item.getLanguage());
                dto.put("position", item.getPosition());
                if (item.getSurah() != null) {
                    dto.put("surahName", item.getSurah().getSurahNameEn());
                }
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(itemDTOs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // DSA: Get next surah (for audio player)
    @GetMapping("/{playlistId}/next/{currentPosition}")
    public ResponseEntity<?> getNextSurah(
            @PathVariable Long playlistId,
            @PathVariable int currentPosition) {

        try {
            Optional<PlaylistItem> nextSurah = playlistService.getNextSurah(playlistId, currentPosition);

            if (nextSurah.isPresent()) {
                PlaylistItem item = nextSurah.get();
                Map<String, Object> response = new HashMap<>();
                response.put("itemId", item.getItemId());
                response.put("surahId", item.getSurahId());
                response.put("language", item.getLanguage());
                response.put("position", item.getPosition());
                if (item.getSurah() != null) {
                    response.put("surahName", item.getSurah().getSurahNameEn());
                }
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "No next surah available");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // DSA: Get previous surah (for audio player)
    @GetMapping("/{playlistId}/previous/{currentPosition}")
    public ResponseEntity<?> getPreviousSurah(
            @PathVariable Long playlistId,
            @PathVariable int currentPosition) {

        try {
            Optional<PlaylistItem> previousSurah = playlistService.getPreviousSurah(playlistId, currentPosition);

            if (previousSurah.isPresent()) {
                PlaylistItem item = previousSurah.get();
                Map<String, Object> response = new HashMap<>();
                response.put("itemId", item.getItemId());
                response.put("surahId", item.getSurahId());
                response.put("language", item.getLanguage());
                response.put("position", item.getPosition());
                if (item.getSurah() != null) {
                    response.put("surahName", item.getSurah().getSurahNameEn());
                }
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "No previous surah available");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get playlist by ID with user validation
    @GetMapping("/{playlistId}")
    public ResponseEntity<?> getPlaylistById(
            @PathVariable Long playlistId,
            @RequestParam Integer userId) {

        try {
            Optional<Playlist> playlist = playlistService.getPlaylistByIdAndUserId(playlistId, userId);

            if (playlist.isPresent()) {
                Map<String, Object> response = createPlaylistDTO(playlist.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Playlist not found or access denied");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 🎯 DEBUG Endpoint: Check what's actually loaded from database
    @GetMapping("/debug/{userId}")
    public ResponseEntity<?> debugPlaylists(@PathVariable Integer userId) {
        List<Playlist> playlists = playlistService.getUserPlaylists(userId);

        List<Map<String, Object>> debugInfo = playlists.stream().map(playlist -> {
            Map<String, Object> info = new HashMap<>();
            info.put("playlistId", playlist.getPlaylistId());
            info.put("playlistName", playlist.getPlaylistName());
            info.put("itemsSize", playlist.getItems() != null ? playlist.getItems().size() : "null");
            info.put("itemCount", playlist.getItemCount());
            info.put("databaseCount", playlistService.getPlaylistItemCount(playlist.getPlaylistId()));
            info.put("hasItems", playlistService.hasItems(playlist.getPlaylistId()));
            return info;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(debugInfo);
    }
    @GetMapping("/debug-counts/{userId}")
    public ResponseEntity<?> debugPlaylistCounts(@PathVariable Integer userId) {
        try {
            List<Playlist> playlists = playlistService.getUserPlaylists(userId);

            List<Map<String, Object>> debugInfo = playlists.stream().map(playlist -> {
                Map<String, Object> info = new HashMap<>();
                info.put("playlistId", playlist.getPlaylistId());
                info.put("playlistName", playlist.getPlaylistName());
                info.put("itemsSize", playlist.getItems() != null ? playlist.getItems().size() : "null");
                info.put("itemCount", playlist.getItemCount());
                info.put("databaseCount", playlistService.getPlaylistItemCount(playlist.getPlaylistId()));
                info.put("hasItems", playlistService.hasItems(playlist.getPlaylistId()));

                // Detailed items info
                if (playlist.getItems() != null) {
                    List<Map<String, Object>> itemsInfo = playlist.getItems().stream().map(item -> {
                        Map<String, Object> itemInfo = new HashMap<>();
                        itemInfo.put("itemId", item.getItemId());
                        itemInfo.put("surahId", item.getSurahId());
                        itemInfo.put("language", item.getLanguage());
                        itemInfo.put("position", item.getPosition());
                        return itemInfo;
                    }).collect(Collectors.toList());
                    info.put("itemsDetails", itemsInfo);
                }

                return info;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    // 🎯 HELPER: Create playlist DTO
    private Map<String, Object> createPlaylistDTO(Playlist playlist) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("playlistId", playlist.getPlaylistId());
        dto.put("playlistName", playlist.getPlaylistName());
        dto.put("userId", playlist.getUserId());

        // Use the getItemCount() method which returns the actual size of items list
        int itemCount = playlist.getItemCount();
        dto.put("itemCount", itemCount);

        System.out.println("🎯 Creating DTO for playlist: " + playlist.getPlaylistName() +
                " with itemCount: " + itemCount);

        // Convert items to simple format - handle null items
        List<PlaylistItem> items = playlist.getItems();
        List<Map<String, Object>> itemDTOs = new ArrayList<>();

        if (items != null) {
            itemDTOs = items.stream().map(item -> {
                Map<String, Object> itemDto = new HashMap<>();
                itemDto.put("itemId", item.getItemId());
                itemDto.put("surahId", item.getSurahId());
                itemDto.put("language", item.getLanguage());
                itemDto.put("position", item.getPosition());
                if (item.getSurah() != null) {
                    itemDto.put("surahName", item.getSurah().getSurahNameEn());
                }
                return itemDto;
            }).collect(Collectors.toList());
        }

        dto.put("items", itemDTOs);

        System.out.println("📊 DTO created - Playlist: " + playlist.getPlaylistName() +
                ", itemCount in DTO: " + dto.get("itemCount") +
                ", actual items size: " + itemDTOs.size());

        return dto;
    }
}