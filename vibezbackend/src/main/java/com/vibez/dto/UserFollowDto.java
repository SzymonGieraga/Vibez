package com.vibez.dto;

public class UserFollowDto {
    private String username;
    private String profilePictureUrl;
    private boolean isFollowedByCurrentUser;

    public UserFollowDto(String username, String profilePictureUrl, boolean isFollowedByCurrentUser) {
        this.username = username;
        this.profilePictureUrl = profilePictureUrl;
        this.isFollowedByCurrentUser = isFollowedByCurrentUser;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public boolean isFollowedByCurrentUser() { return isFollowedByCurrentUser; }
    public void setFollowedByCurrentUser(boolean followedByCurrentUser) { isFollowedByCurrentUser = followedByCurrentUser; }
}