package gieraga.vibezbackend.dto;

public class SaveReelRequest {
    private String fileName;
    private String description;


    public String getFileName() {
        return fileName;
    }
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
}