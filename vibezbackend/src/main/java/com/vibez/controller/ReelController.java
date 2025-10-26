package com.vibez.controller;

import com.vibez.model.Reel;
import com.vibez.model.Tag;
import com.vibez.model.User;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import com.vibez.service.ReelService;
import com.vibez.service.ImageStorageService;
import com.vibez.service.VideoStorageService;
import com.vibez.service.TagService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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

    public ReelController(ReelRepository reelRepository, UserRepository userRepository,
                          VideoStorageService videoStorageService, ImageStorageService imageStorageService,
                          ReelService reelService, TagService tagService) {
        this.reelRepository = reelRepository;
        this.userRepository = userRepository;
        this.videoStorageService = videoStorageService;
        this.imageStorageService = imageStorageService;
        this.reelService = reelService;
        this.tagService = tagService;
    }

    @GetMapping
    public List<Reel> getAllReels() {
        return reelService.getAllReelsWithTopLevelComments();
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Reel> createReel(
            @RequestParam("videoFile") MultipartFile videoFile,  // ZMIANA: videoFile zamiast videoFileName
            @RequestParam(value = "thumbnailFile", required = false) MultipartFile thumbnailFile,
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
            log.error("User not found: {}", username);
            return ResponseEntity.badRequest().build();
        }

        // Upload and convert video
        String videoFileName = videoStorageService.uploadAndConvertVideo(videoFile);
        String videoUrl = videoStorageService.buildPublicUrl(videoFileName);
        log.info("Video uploaded: {}", videoUrl);

        // Upload thumbnail if provided
        String thumbnailUrl = null;
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            thumbnailUrl = imageStorageService.uploadFile(thumbnailFile);
            log.info("Thumbnail uploaded: {}", thumbnailUrl);
        }

        // Process tags
        Set<Tag> tagSet = tagService.findOrCreateTags(tags);

        // Create and save reel
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
}