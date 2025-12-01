package com.vibez.controller;

import com.vibez.dto.UserFollowDto;
import com.vibez.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follows")
@CrossOrigin(origins = "http://localhost:5173")
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleFollow(
            @RequestParam String followerUsername,
            @RequestParam String followingUsername) {
        try {
            boolean isFollowing = followService.toggleFollow(followerUsername, followingUsername);

            Map<String, Object> response = new HashMap<>();
            response.put("isFollowing", isFollowing);
            response.put("followersCount", followService.getFollowersCount(followerUsername));
            response.put("followingCount", followService.getFollowingCount(followingUsername));

            return ResponseEntity.ok(response);
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getFollowerStatus(
            @RequestParam String followerUsername,
            @RequestParam String followingUsername) {
        Map<String, Object> response = new HashMap<>();
        response.put("isFollowing", followService.isFollowing(followerUsername, followingUsername));
        response.put("followersCount", followService.getFollowersCount(followerUsername));
        response.put("followingCount", followService.getFollowingCount(followingUsername));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats/{username}")
    public ResponseEntity<Map<String, Long>> getFollowerStatus(@PathVariable String username){
        Map<String, Long> stats = new HashMap<>();
        stats.put("followers", followService.getFollowersCount(username));
        stats.put("following", followService.getFollowingCount(username));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<UserFollowDto>> getFollowers(
            @PathVariable String username,
            @RequestParam String currentUsername) {

        List<UserFollowDto> followers = followService.getFollowersDto(username, currentUsername);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<UserFollowDto>> getFollowing(
            @PathVariable String username,
            @RequestParam String currentUsername) {

        List<UserFollowDto> following = followService.getFollowingDto(username, currentUsername);
        return ResponseEntity.ok(following);
    }
}
