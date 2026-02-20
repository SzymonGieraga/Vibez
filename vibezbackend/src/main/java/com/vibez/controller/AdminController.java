package com.vibez.controller;

import com.vibez.model.Reel;
import com.vibez.model.Report;
import com.vibez.model.Tag;
import com.vibez.model.User;
import com.vibez.repository.CommentRepository;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.ReportRepository;
import com.vibez.repository.UserRepository;
import com.vibez.service.ImageStorageService;
import com.vibez.service.TagService;
import com.vibez.service.VideoStorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ReelRepository reelRepository;
    private final CommentRepository commentRepository;
    private final TagService tagService;
    private final VideoStorageService videoStorageService;
    private final ImageStorageService imageStorageService;

    public AdminController(ReportRepository reportRepository,
                           UserRepository userRepository,
                           ReelRepository reelRepository,
                           CommentRepository commentRepository,
                           TagService tagService,
                           VideoStorageService videoStorageService,
                           ImageStorageService imageStorageService) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.reelRepository = reelRepository;
        this.commentRepository = commentRepository;
        this.tagService = tagService;
        this.videoStorageService = videoStorageService;
        this.imageStorageService = imageStorageService;
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Report>> getReports() {
        return ResponseEntity.ok(reportRepository.findAll());
    }

    @GetMapping("/reels")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Page<Reel>> getReels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(reelRepository.findAll(pageable));
    }

    @DeleteMapping("/reels/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteReel(@PathVariable Long id) {
        Reel reel = reelRepository.findById(id).orElseThrow();

        if (reel.getVideoUrl() != null) {
            videoStorageService.deleteFileFromUrl(reel.getVideoUrl());
        }

        if (reel.getThumbnailUrl() != null) {
            imageStorageService.deleteFileFromUrl(reel.getThumbnailUrl());
        }

        if (reel.getPreview() != null && reel.getPreview().getFrameUrls() != null) {
            for (String frameUrl : reel.getPreview().getFrameUrls()) {
                imageStorageService.deleteFileFromUrl(frameUrl);
            }
        }

        reelRepository.delete(reel);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/reels/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Transactional
    public ResponseEntity<?> updateReel(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Reel reel = reelRepository.findById(id).orElseThrow();

        if (payload.containsKey("description")) {
            reel.setDescription((String) payload.get("description"));
        }
        if (payload.containsKey("title")) {
            reel.setSongTitle((String) payload.get("title"));
        }
        if (payload.containsKey("artist")) {
            reel.setAuthor((String) payload.get("artist"));
        }
        if (payload.containsKey("tags")) {
            String tagsString = (String) payload.get("tags");
            Set<Tag> tags = tagService.findOrCreateTags(tagsString);
            reel.getTags().clear();
            reel.getTags().addAll(tags);
        }

        reelRepository.save(reel);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/comments/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        commentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestBody String role) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}