package com.vibez.controller;

import com.vibez.model.Reel;
import com.vibez.dto.SaveReelRequest;
import com.vibez.model.User;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.UserRepository;
import com.vibez.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reels")
public class ReelController {

    private final ReelRepository reelRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public ReelController(ReelRepository reelRepository, UserRepository userRepository, StorageService storageService) {
        this.reelRepository = reelRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    @GetMapping
    public List<Reel> getAllReels() {
        return reelRepository.findAllByOrderByIdDesc();
    }

    @PostMapping
    public ResponseEntity<Reel> createReel(@RequestBody SaveReelRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        User user = userOptional.get();

        String videoUrl = storageService.buildPublicUrl(request.getVideoFileName());
        String thumbnailUrl = request.getThumbnailFileName() != null ? storageService.buildPublicUrl(request.getThumbnailFileName()) : null;

        Reel newReel = new Reel();
        newReel.setUser(user);
        newReel.setVideoUrl(videoUrl);
        newReel.setThumbnailUrl(thumbnailUrl);
        newReel.setDescription(request.getDescription());
        newReel.setAuthor(request.getAuthor());
        newReel.setSongTitle(request.getSongTitle());
        newReel.setGenre(request.getGenre());
        newReel.setTags(request.getTags());

        Reel savedReel = reelRepository.save(newReel);
        return ResponseEntity.ok(savedReel);
    }

    @GetMapping("/generate-upload-url")
    public ResponseEntity<String> generateUploadUrl(@RequestParam String fileName, @RequestParam String contentType) {
        String uploadUrl = storageService.generatePresignedUrl(fileName, contentType);
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

