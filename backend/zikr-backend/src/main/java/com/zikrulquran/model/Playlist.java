package com.zikrulquran.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "playlists")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Playlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "playlist_id")
    private Long playlistId;

    @NotNull(message = "Playlist name is required")
    @Column(name = "playlist_name", nullable = false, length = 100)
    private String playlistName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"playlists", "password"})
    private User user;

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"playlist"})
    private List<PlaylistItem> items = new ArrayList<>();

    // Constructors
    public Playlist() {
    }

    public Playlist(String playlistName, User user) {
        this.playlistName = playlistName;
        this.user = user;
    }

    // 🎯 ADD: JSON property for user ID to easily access it
    @JsonProperty("userId")
    public Integer getUserId() {
        return user != null ? user.getUserId() : null;
    }

    // 🎯 ADD: JSON property for item count
    @JsonProperty("itemCount")
    public int getItemCount() {
        return items != null ? items.size() : 0;
    }

    // Getters and Setters
    public Long getPlaylistId() {
        return playlistId;
    }

    public void setPlaylistId(Long playlistId) {
        this.playlistId = playlistId;
    }

    public String getPlaylistName() {
        return playlistName;
    }

    public void setPlaylistName(String playlistName) {
        this.playlistName = playlistName;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<PlaylistItem> getItems() {
        return items;
    }

    public void setItems(List<PlaylistItem> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    // Helper method to add item
    public void addItem(PlaylistItem item) {
        if (items == null) {
            items = new ArrayList<>();
        }
        items.add(item);
        item.setPlaylist(this);
    }

    // Helper method to remove item
    public void removeItem(PlaylistItem item) {
        if (items != null) {
            items.remove(item);
            item.setPlaylist(null);
        }
    }
}