package com.vibez.dto;

import com.vibez.model.Reel;

public class ReelSimpleDto {
    private Long id;
    private String thumbnailUrl;
    private String author;
    private String songTitle;
    private String videoUrl;
    private Long viewCount;

    public ReelSimpleDto(Reel reel) {
        if (reel != null) {
            this.id = reel.getId();
            this.thumbnailUrl = reel.getThumbnailUrl();
            this.author = reel.getAuthor();
            this.songTitle = reel.getSongTitle();
            this.videoUrl = reel.getVideoUrl();
            this.viewCount = reel.getViewCount();
        }
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getSongTitle() { return songTitle; }
    public void setSongTitle(String songTitle) { this.songTitle = songTitle; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public Long getViewCount() { return viewCount; }
    public void setViewCount(Long viewCount) { this.viewCount = viewCount; }
}