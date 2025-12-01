package com.vibez.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reel_previews")
public class ReelPreview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reel_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"preview", "comments", "likes"})
    private Reel reel;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "preview_frame_urls", joinColumns = @JoinColumn(name = "preview_id"))
    @Column(name = "frame_url", length = 500)
    @OrderColumn(name = "frame_order")
    private List<String> frameUrls = new ArrayList<>();

    private Integer frameCount;
    private Double frameInterval;

    public ReelPreview() {}

    public ReelPreview(Reel reel) {
        this.reel = reel;
        this.frameUrls = new ArrayList<>();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reel getReel() { return reel; }
    public void setReel(Reel reel) { this.reel = reel; }

    public List<String> getFrameUrls() {
        if (frameUrls == null) {
            frameUrls = new ArrayList<>();
        }
        return frameUrls;
    }

    public void setFrameUrls(List<String> frameUrls) {
        this.frameUrls = frameUrls != null ? frameUrls : new ArrayList<>();
        this.frameCount = this.frameUrls.size();
    }

    public Integer getFrameCount() { return frameCount; }
    public void setFrameCount(Integer frameCount) { this.frameCount = frameCount; }

    public Double getFrameInterval() { return frameInterval; }
    public void setFrameInterval(Double frameInterval) { this.frameInterval = frameInterval; }
}