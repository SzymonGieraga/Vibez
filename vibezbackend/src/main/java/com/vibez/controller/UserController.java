package com.vibez.controller;

import com.vibez.dto.SyncUserRequest;
import com.vibez.model.Reel;
import com.vibez.model.User;
import com.vibez.repository.UserRepository;
import com.vibez.repository.ReelRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ReelRepository reelRepository;

    public UserController(UserRepository userRepository,ReelRepository reelRepository) {
        this.userRepository = userRepository;
        this.reelRepository = reelRepository;
    }

    @PostMapping("/sync")
    public ResponseEntity<User> syncUser(@RequestBody SyncUserRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    String username = request.getEmail().split("@")[0];
                    if (userRepository.findByUsername(username).isPresent()) {
                        username = username + (int)(Math.random() * 1000);
                    }
                    User newUser = new User(username, request.getEmail());
                    return userRepository.save(newUser);
                });
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{username:.+}")
    public ResponseEntity<User> getUserProfile(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{username:.+}")
    public ResponseEntity<User> updateUserProfile(@PathVariable String username, @RequestBody User userDetails) {
        return userRepository.findByUsername(username).map(user -> {
            user.setBio(userDetails.getBio());
            user.setProfilePictureUrl(userDetails.getProfilePictureUrl());
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        }).orElse(ResponseEntity.notFound().build());
    }
}

