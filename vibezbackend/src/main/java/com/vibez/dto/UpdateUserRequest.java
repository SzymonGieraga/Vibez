package com.vibez.dto;

public class UpdateUserRequest {

    private String username;
    private String bio;
    private String profilePictureFileName;

    public String getUsername() {return username;}
    public void setUsername(String username) {this.username = username;}
    public String getBio() {return bio;}
    public void setBio(String bio) {this.bio = bio;}
    public String getProfilePictureFileName() {return profilePictureFileName;}
    public void setProfilePictureFileName(String profilePictureFileName) {this.profilePictureFileName = profilePictureFileName;}
}

