package com.zikrulquran.controller;

import com.zikrulquran.model.Surah;
import com.zikrulquran.service.SurahService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/surahs")
@CrossOrigin(origins = "http://localhost:3000")
public class SurahController {

    @Autowired
    private SurahService surahService;

    // Get all surahs
    @GetMapping
    public ResponseEntity<?> getAllSurahs() {
        try {
            List<Surah> surahs = surahService.getAllSurahs();
            return ResponseEntity.ok(surahs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch surahs: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get surah by ID
    @GetMapping("/{surahId}")
    public ResponseEntity<?> getSurahById(@PathVariable Integer surahId) {
        try {
            // Validate surah ID
            if (surahId < 1 || surahId > 114) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid surah ID. Must be between 1 and 114");
                return ResponseEntity.badRequest().body(error);
            }

            Optional<Surah> surah = surahService.getSurahById(surahId);

            if (surah.isPresent()) {
                return ResponseEntity.ok(surah.get());
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Surah not found with ID: " + surahId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Search surahs by name (English)
    @GetMapping("/search")
    public ResponseEntity<?> searchSurahs(@RequestParam String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Search query cannot be empty");
                return ResponseEntity.badRequest().body(error);
            }

            List<Surah> surahs = surahService.searchSurahsByName(name);
            return ResponseEntity.ok(surahs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Search failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get multiple surahs by IDs
    @PostMapping("/batch")
    public ResponseEntity<?> getSurahsByIds(@RequestBody Map<String, List<Integer>> request) {
        try {
            List<Integer> surahIds = request.get("surahIds");

            if (surahIds == null || surahIds.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "surahIds array is required");
                return ResponseEntity.badRequest().body(error);
            }

            List<Surah> surahs = surahService.getSurahsByIds(surahIds);
            return ResponseEntity.ok(surahs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}