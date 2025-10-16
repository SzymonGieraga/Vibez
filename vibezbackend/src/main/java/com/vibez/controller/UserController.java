package com.vibez.controller;

import com.vibez.dto.SyncUserRequest;
import com.vibez.dto.UpdateUserRequest;
import com.vibez.model.User;
import com.vibez.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
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
    public ResponseEntity<?> updateUserProfile(@PathVariable String username, @RequestBody UpdateUserRequest request) {
        return userRepository.findByUsername(username).map(userToUpdate -> {

            if (request.getBio() != null) {
                userToUpdate.setBio(request.getBio());
            }

            if (request.getProfilePictureUrl() != null) {
                userToUpdate.setProfilePictureUrl(request.getProfilePictureUrl());
            }

            if (request.getUsername() != null && !request.getUsername().isEmpty() && !request.getUsername().equals(username)) {
                if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken");
                }
                userToUpdate.setUsername(request.getUsername());
            }

            User updatedUser = userRepository.save(userToUpdate);
            return ResponseEntity.ok(updatedUser);

        }).orElse(ResponseEntity.notFound().build());
    }
}

