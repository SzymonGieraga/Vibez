package com.vibez.dto;

import com.vibez.model.User;

public class UserSimpleDto {
    private String username;
    private String profilePictureUrl;

    public UserSimpleDto(User user) {
        if (user != null) {
            this.username = user.getUsername();
            this.profilePictureUrl = user.getProfilePictureUrl();
        }
    }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
}