package com.zikrulquran.service;

import com.zikrulquran.model.Surah;
import com.zikrulquran.repository.SurahRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SurahService {

    @Autowired
    private SurahRepository surahRepository;

    public List<Surah> getAllSurahs() {
        return surahRepository.findAllByOrderBySurahIdAsc();
    }

    public Optional<Surah> getSurahById(Integer surahId) {
        if (surahId == null || surahId < 1 || surahId > 114) {
            throw new IllegalArgumentException("Invalid surah ID: " + surahId);
        }
        return surahRepository.findById(surahId);
    }

    public List<Surah> searchSurahsByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Search name cannot be empty");
        }
        return surahRepository.searchBySurahName(name.trim());
    }

    // NEW: Get multiple surahs by IDs
    public List<Surah> getSurahsByIds(List<Integer> surahIds) {
        if (surahIds == null || surahIds.isEmpty()) {
            throw new IllegalArgumentException("Surah IDs cannot be null or empty");
        }
        return surahRepository.findBySurahIdIn(surahIds);
    }

    // NEW: Check if surah exists
    public boolean surahExists(Integer surahId) {
        if (surahId == null) {
            throw new IllegalArgumentException("Surah ID cannot be null");
        }
        return surahRepository.existsBySurahId(surahId);
    }
}