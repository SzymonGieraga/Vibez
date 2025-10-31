package com.vibez.controller;

import com.vibez.model.Reel;
import com.vibez.model.ReelPreview;
import com.vibez.model.Tag;
import com.vibez.model.User;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import com.vibez.service.ReelService;
import com.vibez.service.ImageStorageService;
import com.vibez.service.VideoStorageService;
import com.vibez.service.ReelPreviewService;
import com.vibez.service.TagService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/reels")
public class ReelController {

    private final ReelRepository reelRepository;
    private final UserRepository userRepository;
    private final VideoStorageService videoStorageService;
    private final ImageStorageService imageStorageService;
    private final ReelService reelService;
    private final TagService tagService;
    private final ReelPreviewService reelPreviewService;

    public ReelController(ReelRepository reelRepository, UserRepository userRepository,
                          VideoStorageService videoStorageService, ImageStorageService imageStorageService,
                          ReelService reelService, TagService tagService, ReelPreviewService reelPreviewService) {
        this.reelRepository = reelRepository;
        this.userRepository = userRepository;
        this.videoStorageService = videoStorageService;
        this.imageStorageService = imageStorageService;
        this.reelService = reelService;
        this.tagService = tagService;
        this.reelPreviewService = reelPreviewService;
    }

    @GetMapping
    public List<Reel> getAllReels() {
        return reelService.getAllReelsWithTopLevelComments();
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Reel> createReel(
            @RequestParam("videoFile") MultipartFile videoFile,
            @RequestParam(value = "thumbnailFile", required = false) MultipartFile thumbnailFile,
            @RequestParam(value = "previewFrame0", required = false) MultipartFile previewFrame0,
            @RequestParam(value = "previewFrame1", required = false) MultipartFile previewFrame1,
            @RequestParam(value = "previewFrame2", required = false) MultipartFile previewFrame2,
            @RequestParam(value = "previewFrame3", required = false) MultipartFile previewFrame3,
            @RequestParam(value = "previewFrame4", required = false) MultipartFile previewFrame4,
            @RequestParam(value = "previewFrame5", required = false) MultipartFile previewFrame5,
            @RequestParam("username") String username,
            @RequestParam("description") String description,
            @RequestParam("author") String author,
            @RequestParam("songTitle") String songTitle,
            @RequestParam("genre") String genre,
            @RequestParam("tags") String tags
    ) throws IOException {

        log.info("Creating reel for user: {}, video file: {}", username, videoFile.getOriginalFilename());

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        VideoStorageService.VideoUploadResult uploadResult = videoStorageService.uploadAndConvertVideo(videoFile);
        String videoUrl = videoStorageService.buildPublicUrl(uploadResult.videoFileName);

        String thumbnailUrl = null;
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            thumbnailUrl = imageStorageService.uploadFile(thumbnailFile);
        }
        Set<Tag> tagSet = tagService.findOrCreateTags(tags);

        Reel newReel = new Reel();
        newReel.setUser(userOptional.get());
        newReel.setVideoUrl(videoUrl);
        newReel.setThumbnailUrl(thumbnailUrl);
        newReel.setDescription(description);
        newReel.setAuthor(author);
        newReel.setSongTitle(songTitle);
        newReel.setGenre(genre);
        newReel.setTags(tagSet);

        Reel savedReel = reelRepository.save(newReel);

        List<String> previewFrameUrls = new ArrayList<>();
        MultipartFile[] previewFrames = {previewFrame0, previewFrame1, previewFrame2,
                previewFrame3, previewFrame4, previewFrame5};

        for (MultipartFile frame : previewFrames) {
            if (frame != null && !frame.isEmpty()) {
                String frameUrl = imageStorageService.uploadFile(frame);
                previewFrameUrls.add(frameUrl);
            }
        }

        if (!previewFrameUrls.isEmpty()) {
            reelPreviewService.createPreview(savedReel, previewFrameUrls);
        }

        log.info("Reel created successfully with ID: {}", savedReel.getId());

        return ResponseEntity.ok(savedReel);
    }

    @GetMapping("/user/{username:.+}")
    public ResponseEntity<List<Reel>> getReelsByUsername(@PathVariable String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            List<Reel> reels = reelService.getReelsByUserWithTopLevelComments(userOptional.get());
            return ResponseEntity.ok(reels);
        } else {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/liked/{username:.+}")
    public ResponseEntity<List<Reel>> getLikedReels(@PathVariable String username) {
        try {
            List<Reel> likedReels = reelService.getLikedReelsByUsername(username);
            return ResponseEntity.ok(likedReels);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{reelId}/like")
    public ResponseEntity<Reel> likeReel(@PathVariable Long reelId, @RequestParam String username) {
        try {
            Reel likedReel = reelService.likeReel(reelId, username);
            return ResponseEntity.ok(likedReel);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{reelId}/like")
    public ResponseEntity<Reel> unlikeReel(@PathVariable Long reelId, @RequestParam String username) {
        try {
            Reel unlikedReel = reelService.unlikeReel(reelId, username);
            return ResponseEntity.ok(unlikedReel);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{reelId}/preview")
    public ResponseEntity<ReelPreview> getReelPreview(@PathVariable Long reelId) {
        Optional<ReelPreview> preview = reelPreviewService.getPreviewByReelId(reelId);
        return preview.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/{reelId}/playlists")
    public ResponseEntity<List<String>> getPlaylistsForReel(
            @PathVariable Long reelId,
            @RequestParam String requestingUsername
    ) {
        try {
            List<String> playlistNames = reelService.getPlaylistsForReel(reelId, requestingUsername);
            return ResponseEntity.ok(playlistNames);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}