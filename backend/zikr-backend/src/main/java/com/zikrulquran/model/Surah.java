package com.zikrulquran.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "surahs")
public class Surah {
    @Id
    @NotNull(message = "Surah ID is required")
    @Column(name = "surah_id")
    private Integer surahId;

    @NotBlank(message = "Surah name is required")
    @Column(name = "surah_name_en", nullable = false, length = 100)
    private String surahNameEn;

    @OneToMany(mappedBy = "surah", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PlaylistItem> playlistItems = new ArrayList<>();

    // Constructors
    public Surah() {}

    public Surah(Integer surahId, String surahNameEn) {
        this.surahId = surahId;
        this.surahNameEn = surahNameEn;
    }

    // Getters and Setters
    public Integer getSurahId() {
        return surahId;
    }

    public void setSurahId(Integer surahId) {
        this.surahId = surahId;
    }

    public String getSurahNameEn() {
        return surahNameEn;
    }

    public void setSurahNameEn(String surahNameEn) {
        this.surahNameEn = surahNameEn;
    }

    public List<PlaylistItem> getPlaylistItems() {
        return playlistItems;
    }

    public void setPlaylistItems(List<PlaylistItem> playlistItems) {
        this.playlistItems = playlistItems;
    }
}