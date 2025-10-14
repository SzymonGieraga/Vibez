package gieraga.vibezbackend.controller;

import gieraga.vibezbackend.dto.SaveReelRequest;
import gieraga.vibezbackend.model.Reel;
import gieraga.vibezbackend.repo.ReelRepo;
import gieraga.vibezbackend.service.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URL;
import java.util.List;

@RestController
@RequestMapping("/api/reels")
@CrossOrigin(origins = "http://localhost:5173")
public class ReelController {

    private final ReelRepo reelRepository;
    private final StorageService storageService;

    @Value("${r2.public.url}")
    private String r2PublicUrl;

    public ReelController(ReelRepo reelRepository, StorageService storageService) {
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
}

