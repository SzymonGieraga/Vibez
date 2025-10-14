package gieraga.vibezbackend.dto;

public class SaveReelRequest {
    private String VideoFileName;
    private String description;
    private String ThumbnailFileName;
    private String author;
    private String songTitle;
    private String genre;
    private String tags;
    private String username;

    public String getVideoFileName() {
        return VideoFileName;
    }
    public void setVideoFileName(String videoFileName) {
        this.VideoFileName = videoFileName;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public String getThumbnailFileName() {
        return ThumbnailFileName;
    }
    public void setThumbnailFileName(String ThumbnailFileName) {
        this.ThumbnailFileName = ThumbnailFileName;
    }

    public String getAuthor() {
        return author;
    }
    public void setAuthor(String author) {
        this.author = author;
    }

    public String getSongTitle() {
        return songTitle;
    }
    public void setSongTitle(String songTitle) {
        this.songTitle = songTitle;
    }

    public String getGenre() {return genre;}
    public void setGenre(String genre) {this.genre = genre;}

    public String getTags() {return tags;}
    public void setTags(String tags) {this.tags = tags;}

    public String getUsername() {return username;}
    public void setUsername(String username) {this.username = username;}

}