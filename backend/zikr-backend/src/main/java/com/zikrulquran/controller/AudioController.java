package com.zikrulquran.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/audio")
@CrossOrigin(origins = "http://localhost:3000")
public class AudioController {

    private static final Logger logger = LoggerFactory.getLogger(AudioController.class);

    // Get audio file path for a surah and language
    @GetMapping("/surah/{surahId}/{language}")
    public ResponseEntity<?> getAudioPath(
            @PathVariable Integer surahId,
            @PathVariable String language) {

        logger.info("🎵 Audio path request - Surah: {}, Language: {}", surahId, language);

        // Validate surah ID
        if (surahId < 1 || surahId > 114) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid surah ID. Must be between 1 and 114");
            return ResponseEntity.badRequest().body(error);
        }

        // Validate language
        if (!isValidLanguage(language)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid language. Use: arabic, english, or urdu");
            return ResponseEntity.badRequest().body(error);
        }

        // Build file path - now using the correct API endpoint
        String filePath = "/api/audio/files/" + language + "/" + surahId;
        String fullUrl = "http://localhost:8080" + filePath;

        Map<String, String> response = new HashMap<>();
        response.put("filePath", filePath);
        response.put("url", fullUrl);
        response.put("surahId", surahId.toString());
        response.put("language", language);

        logger.info("✅ Audio path response: {}", response);
        return ResponseEntity.ok(response);
    }

    // Serve actual audio files from classpath
    @GetMapping("/files/{language}/{surahId}")
    public ResponseEntity<Resource> serveAudioFile(
            @PathVariable String language,
            @PathVariable Integer surahId) {

        logger.info("🔊 Serving audio file - Language: {}, Surah: {}", language, surahId);

        try {
            // Validate inputs
            if (!isValidLanguage(language) || surahId < 1 || surahId > 114) {
                logger.warn("❌ Invalid request - Language: {}, Surah: {}", language, surahId);
                return ResponseEntity.notFound().build();
            }

            // Build classpath path - files are now in src/main/resources/static/audio/
            String classpathPath = "static/audio/" + language + "/" + surahId + ".mp3";
            logger.info("📁 Looking for audio file in classpath: {}", classpathPath);

            Resource resource = new ClassPathResource(classpathPath);

            if (resource.exists() && resource.isReadable()) {
                logger.info("✅ Audio file found and readable: {}.mp3", surahId);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType("audio/mpeg"))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + surahId + ".mp3\"")
                        .body(resource);
            } else {
                logger.error("❌ Audio file not found or not readable: {}", classpathPath);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("❌ Error serving audio file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get available languages
    @GetMapping("/languages")
    public ResponseEntity<?> getAvailableLanguages() {
        Map<String, Object> response = new HashMap<>();
        response.put("languages", new String[]{"arabic", "english", "urdu"});
        response.put("default", "arabic");
        logger.info("🌐 Available languages requested");
        return ResponseEntity.ok(response);
    }

    // Debug endpoint to check file existence
    @GetMapping("/debug/{language}/{surahId}")
    public ResponseEntity<?> debugAudioFile(
            @PathVariable String language,
            @PathVariable Integer surahId) {

        Map<String, Object> debugInfo = new HashMap<>();

        try {
            String classpathPath = "static/audio/" + language + "/" + surahId + ".mp3";
            Resource resource = new ClassPathResource(classpathPath);

            debugInfo.put("surahId", surahId);
            debugInfo.put("language", language);
            debugInfo.put("classpathPath", classpathPath);
            debugInfo.put("exists", resource.exists());
            debugInfo.put("description", resource.getDescription());

            if (resource.exists()) {
                try {
                    debugInfo.put("fileSize", resource.contentLength());
                    debugInfo.put("readable", resource.isReadable());
                    debugInfo.put("url", resource.getURL().toString());
                } catch (Exception e) {
                    debugInfo.put("fileSizeError", e.getMessage());
                }
            }

            logger.info("🔍 Debug info: {}", debugInfo);
            return ResponseEntity.ok(debugInfo);

        } catch (Exception e) {
            debugInfo.put("error", e.getMessage());
            logger.error("❌ Debug error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(debugInfo);
        }
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Audio Controller");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        response.put("servingFrom", "classpath:static/audio/");
        logger.info("❤️ Health check requested");
        return ResponseEntity.ok(response);
    }

    // Helper method to validate language
    private boolean isValidLanguage(String language) {
        return language.equals("arabic") || language.equals("english") || language.equals("urdu");
    }
}