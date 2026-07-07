package com.zikrulquran.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "playlist_items")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PlaylistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    @JsonIgnoreProperties({"items", "user"})
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surah_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Surah surah;

    @NotNull(message = "Language is required")
    @Column(name = "language", nullable = false, length = 20)
    private String language;

    @NotNull(message = "Position is required")
    @Column(name = "position", nullable = false)
    private Integer position;

    // Constructors
    public PlaylistItem() {
    }

    public PlaylistItem(Playlist playlist, Surah surah, String language, Integer position) {
        this.playlist = playlist;
        this.surah = surah;
        this.language = language;
        this.position = position;
    }

    // 🎯 ADD: JSON property for surah ID to easily access it
    @JsonProperty("surahId")
    public Integer getSurahId() {
        return surah != null ? surah.getSurahId() : null;
    }

    // 🎯 ADD: JSON property for surah name
    @JsonProperty("surahName")
    public String getSurahName() {
        return surah != null ? surah.getSurahNameEn() : null;
    }

    // Getters and Setters
    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Playlist getPlaylist() {
        return playlist;
    }

    public void setPlaylist(Playlist playlist) {
        this.playlist = playlist;
    }

    public Surah getSurah() {
        return surah;
    }

    public void setSurah(Surah surah) {
        this.surah = surah;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }
}