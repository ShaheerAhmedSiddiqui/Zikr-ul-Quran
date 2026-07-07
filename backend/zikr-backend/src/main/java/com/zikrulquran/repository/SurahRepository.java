package com.zikrulquran.repository;

import com.zikrulquran.model.Surah;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SurahRepository extends JpaRepository<Surah, Integer> {

    List<Surah> findBySurahNameEnContainingIgnoreCase(String name);

    // NEW: Find surah by exact name match
    Optional<Surah> findBySurahNameEnIgnoreCase(String name);

    // NEW: Find multiple surahs by IDs
    List<Surah> findBySurahIdIn(List<Integer> surahIds);

    // NEW: Check if surah exists
    Boolean existsBySurahId(Integer surahId);

    // NEW: Get all surahs ordered by ID
    List<Surah> findAllByOrderBySurahIdAsc();

    // NEW: Search surahs with custom query for better performance
    @Query("SELECT s FROM Surah s WHERE LOWER(s.surahNameEn) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY s.surahId")
    List<Surah> searchBySurahName(@Param("keyword") String keyword);
}