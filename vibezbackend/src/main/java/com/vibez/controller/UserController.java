package com.vibez.controller;

import com.vibez.dto.SyncUserRequest;
import com.vibez.model.User;
import com.vibez.repository.DeviceTokenRepository;
import com.vibez.service.ImageStorageService;
import com.vibez.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.vibez.model.DeviceToken;
import java.security.Principal;

import org.springframework.web.multipart.MultipartFile;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;
    private final DeviceTokenRepository deviceTokenRepository;

    public UserController(UserRepository userRepository, ImageStorageService imageStorageService,  DeviceTokenRepository deviceTokenRepository) {
        this.userRepository = userRepository;
        this.imageStorageService = imageStorageService;
        this.deviceTokenRepository = deviceTokenRepository;
    }

    @GetMapping("/generate-profile-picture-url")
    public ResponseEntity<String> generateProfilePictureUploadUrl(@RequestParam String fileName, @RequestParam String contentType) {
        String uploadUrl = imageStorageService.generatePresignedUrl(fileName, contentType);
        return ResponseEntity.ok(uploadUrl);
    }

    @PostMapping("/sync")
    public ResponseEntity<User> syncUser(@RequestBody SyncUserRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    String username = request.getEmail().split("@")[0];
                    if (userRepository.findByUsername(username).isPresent()) {
                        username = username + (int) (Math.random() * 1000);
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

    @PutMapping("/{username}")
    public ResponseEntity<?> updateUser(
            @PathVariable String username,
            @RequestParam("username") String newUsername,
            @RequestParam("bio") String bio,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {

        try {
            User user = userRepository.findByUsername(username)
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            if (!username.equals(newUsername)) {
                Optional<User> existingUser = userRepository.findByUsername(newUsername);
                if (existingUser.isPresent()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Username already taken");
                }
                user.setUsername(newUsername);
            }

            user.setBio(bio);

            if (profilePicture != null && !profilePicture.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + profilePicture.getOriginalFilename();
                String contentType = profilePicture.getContentType();

                String presignedUrl = imageStorageService.generatePresignedUrl(fileName, contentType);

                HttpURLConnection connection = (HttpURLConnection) new URL(presignedUrl).openConnection();
                connection.setDoOutput(true);
                connection.setRequestMethod("PUT");
                connection.setRequestProperty("Content-Type", contentType);

                try (OutputStream out = connection.getOutputStream()) {
                    out.write(profilePicture.getBytes());
                }

                int responseCode = connection.getResponseCode();
                if (responseCode != 200) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Failed to upload profile picture");
                }

                String publicUrl = imageStorageService.buildPublicUrl(fileName);
                user.setProfilePictureUrl(publicUrl);
            }

            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating profile: " + e.getMessage());
        }
    }
    @PostMapping("/me/register-device-token")
    public ResponseEntity<?> registerDeviceToken(@RequestBody String token, Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + principal.getName()));

        if (deviceTokenRepository.findByToken(token).isEmpty()) {
            DeviceToken newDeviceToken = new DeviceToken(token, currentUser);
            deviceTokenRepository.save(newDeviceToken);
            return ResponseEntity.ok().body("Token registered successfully");
        } else {
            return ResponseEntity.ok().body("Token was already registered");
        }
    }
}