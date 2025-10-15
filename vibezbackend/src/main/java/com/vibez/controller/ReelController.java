package com.vibez.controller;

import com.vibez.dto.SaveReelRequest;
import com.vibez.model.Reel;
import com.vibez.repository.ReelRepository;
import com.vibez.service.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/reels")
@CrossOrigin(origins = "http://localhost:5173")
public class ReelController {

    private final ReelRepository reelRepository;
    private final StorageService storageService;

    @Value("${r2.public.url}")
    private String r2PublicUrl;

    public ReelController(ReelRepository reelRepository, StorageService storageService) {
        this.reelRepository = reelRepository;
        this.storageService = storageService;
    }

    @GetMapping
    public List<Reel> getAllReels() {
        return reelRepository.findAll();
    }

    @PostMapping
    public Reel saveReel(@RequestBody SaveReelRequest request) {
        Reel newReel = new Reel();

        newReel.setVideoUrl(r2PublicUrl + "/" + request.getVideoFileName());
        if (request.getThumbnailFileName() != null && !request.getThumbnailFileName().isEmpty()) {
            newReel.setThumbnailUrl(r2PublicUrl + "/" + request.getThumbnailFileName());
        }

        newReel.setDescription(request.getDescription());
        newReel.setUsername(request.getUsername());
        newReel.setAuthor(request.getAuthor());
        newReel.setSongTitle(request.getSongTitle());
        newReel.setGenre(request.getGenre());
        newReel.setTags(request.getTags());

        return reelRepository.save(newReel);
    }

    @GetMapping("/generate-upload-url")
    public ResponseEntity<String> generateUploadUrl(@RequestParam String fileName, @RequestParam String contentType) {
        String uploadUrl = storageService.generatePresignedUrl(fileName, contentType);
        return ResponseEntity.ok(uploadUrl);
    }
    @GetMapping("/user/{username:.+}")
    public ResponseEntity<List<Reel>> getReelsByUsername(@PathVariable String username) {
        List<Reel> reels = reelRepository.findByUsername(username);
        return ResponseEntity.ok(reels);
    }
}

