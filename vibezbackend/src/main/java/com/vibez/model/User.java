package com.vibez.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority; // <-- NOWY IMPORT
import org.springframework.security.core.authority.SimpleGrantedAuthority; // <-- NOWY IMPORT
import org.springframework.security.core.userdetails.UserDetails; // <-- NOWY IMPORT

import java.util.*; // <-- NOWY IMPORT (dla Collection i Collections)

@Entity
@Table(name = "app_users")
// Dodajemy implementację interfejsu UserDetails
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String bio;
    private String profilePictureUrl;

    // ... (Twoje istniejące relacje - bez zmian) ...
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<Comment> comments;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Like> likes = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<CommentLike> likedComments = new HashSet<>();

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Playlist> playlists = new ArrayList<>();

    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Follow> following = new HashSet<>();

    @OneToMany(mappedBy = "following", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Follow> followers = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<DeviceToken> deviceTokens = new HashSet<>();


    // ... (Twoje istniejące konstruktory i gettery/settery - bez zmian) ...
    public User() {}
    public User(String username, String email) {this.username = username;this.email = email;}
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getUsername() {return username;} // Ta metoda jest wymagana przez UserDetails
    public void setUsername(String username) {this.username = username;}
    public String getEmail() {return email;}
    public void setEmail(String email) {this.email = email;}
    public String getBio() {return bio;}
    public void setBio(String bio) {this.bio = bio;}
    public String getProfilePictureUrl() {return profilePictureUrl;}
    public void setProfilePictureUrl(String profilePictureUrl) {this.profilePictureUrl = profilePictureUrl;}
    public Set<Like> getLikes() { return likes; }
    public void setLikes(Set<Like> likes) { this.likes = likes; }
    public Set<CommentLike> getLikedComments() { return likedComments; }
    public void setLikedComments(Set<CommentLike> likedComments) { this.likedComments = likedComments; }
    public List<Playlist> getPlaylists() { return playlists; }
    public void setPlaylists(List<Playlist> playlists) { this.playlists = playlists; }
    public Set<Follow> getFollowing() { return following; }
    public void setFollowing(Set<Follow> following) { this.following = following; }
    public Set<Follow> getFollowers() { return followers; }
    public void setFollowers(Set<Follow> followers) { this.followers = followers; }
    public Set<DeviceToken> getDeviceTokens() {return deviceTokens;}
    public void setDeviceTokens(Set<DeviceToken> deviceTokens) {this.deviceTokens = deviceTokens;}


    // --- Metody z interfejsu UserDetails ---
    // (To są "rozszerzenia", o które prosiłeś)

    @Override
    @JsonIgnore // Ukryj to pole przed serializacją JSON
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Dajemy każdemu użytkownikowi domyślną rolę.
        // Możesz to rozbudować, jeśli dodasz pole "role" do encji User.
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    @JsonIgnore // Ukryj to pole przed serializacją JSON
    public String getPassword() {
        // Używamy Firebase, więc nie przechowujemy hasła w tej bazie.
        return null;
    }

    @Override
    @JsonIgnore // Ukryj to pole przed serializacją JSON
    public boolean isAccountNonExpired() {
        // Zakładamy, że konta nie wygasają
        return true;
    }

    @Override
    @JsonIgnore // Ukryj to pole przed serializacją JSON
    public boolean isAccountNonLocked() {
        // Zakładamy, że konta nie są blokowane
        return true;
    }

    @Override
    @JsonIgnore // Ukryj to pole przed serializacją JSON
    public boolean isCredentialsNonExpired() {
        // Zakładamy, że "dane uwierzytelniające" (token) nie wygasają na poziomie bazy
        return true;
    }

    @Override
    @JsonIgnore // Ukryj to pole przed serializacją JSON
    public boolean isEnabled() {
        // Zakładamy, że wszyscy użytkownicy w bazie są aktywni
        return true;
    }
}