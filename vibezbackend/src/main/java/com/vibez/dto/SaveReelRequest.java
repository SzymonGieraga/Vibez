package com.vibez.dto;

public class SaveReelRequest {
    private String videoFileName;
    private String thumbnailFileName;
    private String description;
    private String author;
    private String songTitle;
    private String genre;
    private String tags;
    private String username;


    public String getVideoFileName() {return videoFileName;}
    public void setVideoFileName(String videoFileName) {this.videoFileName = videoFileName;}

    public String getThumbnailFileName() {return thumbnailFileName;}
    public void setThumbnailFileName(String thumbnailFileName) {this.thumbnailFileName = thumbnailFileName;}

    public String getDescription() {return description;}
    public void setDescription(String description) {this.description = description;}

    public String getAuthor() {return author;}
    public void setAuthor(String author) {this.author = author;}

    public String getSongTitle() {return songTitle;}
    public void setSongTitle(String songTitle) {this.songTitle = songTitle;}

    public String getGenre() {return genre;}
    public void setGenre(String genre) {this.genre = genre;}

    public String getTags() {return tags;}
    public void setTags(String tags) {this.tags = tags;}

    public String getUsername() {return username;}
    public void setUsername(String username) {this.username = username;}
}