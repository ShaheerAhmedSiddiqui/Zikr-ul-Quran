package com.zikrulquran.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/status")
    public String getStatus() {
        return "Zikr-ul-Quran Backend is running successfully! 🕌";
    }

    @GetMapping("/test")
    public Map<String, String> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "API is working!");
        response.put("status", "success");
        response.put("app", "Zikr-ul-Quran");
        return response;
    }

    @GetMapping("/endpoints")
    public Map<String, String> getAvailableEndpoints() {
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("Users", "GET/POST/PUT/DELETE /api/users");
        endpoints.put("Surahs", "GET/POST /api/surahs");
        endpoints.put("Audio", "GET/POST /api/audio");
        endpoints.put("Playlists", "GET/POST/PUT/DELETE /api/playlists");
        endpoints.put("DSA Operations", "GET /api/playlists/{id}/linked-list");
        return endpoints;
    }
}