package com.vibez.controller;

import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import com.vibez.service.ImageStorageService;
import com.vibez.service.VideoStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reels")
public class ReelController {

    private final ReelRepository reelRepository;
    private final UserRepository userRepository;
    private final VideoStorageService videoStorageService;
    private final ImageStorageService imageStorageService;

    public ReelController(ReelRepository reelRepository, UserRepository userRepository, VideoStorageService videoStorageService, ImageStorageService imageStorageService) {
        this.reelRepository = reelRepository;
        this.userRepository = userRepository;
        this.videoStorageService = videoStorageService;
        this.imageStorageService = imageStorageService;
    }

    @GetMapping
    public List<Reel> getAllReels() {
        return reelRepository.findAllByOrderByIdDesc();
    }


    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Reel> createReel(
            @RequestParam("videoFileName") String videoFileName,
            @RequestParam(value = "thumbnailFile", required = false) MultipartFile thumbnailFile,
            @RequestParam("username") String username,
            @RequestParam("description") String description,
            @RequestParam("author") String author,
            @RequestParam("songTitle") String songTitle,
            @RequestParam("genre") String genre,
            @RequestParam("tags") String tags
    ) throws IOException {

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }


        String thumbnailUrl = null;
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            thumbnailUrl = imageStorageService.uploadFile(thumbnailFile);
        }

        Reel newReel = new Reel();
        newReel.setUser(userOptional.get());
        newReel.setVideoUrl(videoStorageService.buildPublicUrl(videoFileName));
        newReel.setThumbnailUrl(thumbnailUrl);
        newReel.setDescription(description);
        newReel.setAuthor(author);
        newReel.setSongTitle(songTitle);
        newReel.setGenre(genre);
        newReel.setTags(tags);

        Reel savedReel = reelRepository.save(newReel);
        return ResponseEntity.ok(savedReel);
    }
    @GetMapping("/generate-upload-url")
    public ResponseEntity<String> generateUploadUrl(@RequestParam String fileName, @RequestParam String contentType) {
        String uploadUrl = videoStorageService.generatePresignedUrl(fileName, contentType);
        return ResponseEntity.ok(uploadUrl);
    }

    @GetMapping("/user/{username:.+}")
    public ResponseEntity<List<Reel>> getReelsByUsername(@PathVariable String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            List<Reel> reels = reelRepository.findByUser(userOptional.get());
            return ResponseEntity.ok(reels);
        } else {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}

