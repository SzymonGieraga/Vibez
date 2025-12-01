package com.vibez.controller;

import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(searchService.searchUsers(query));
    }

    @GetMapping("/reels")
    public ResponseEntity<List<Reel>> searchReels(@RequestParam String query) {
        return ResponseEntity.ok(searchService.searchReelsByDescription(query));
    }

    @GetMapping("/tags")
    public ResponseEntity<List<Reel>> searchReelsByTag(@RequestParam String query) {
        return ResponseEntity.ok(searchService.searchReelsByTag(query));
    }
    @GetMapping("/top")
    public ResponseEntity<List<User>> searchTop(@RequestParam String query) {
        //TODO: Something more sophisticated in the future
        return ResponseEntity.ok(searchService.searchUsers(query));
    }
}