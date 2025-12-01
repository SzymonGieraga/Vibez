package com.vibez.controller;

import com.vibez.dto.InAppNotificationDto;
import com.vibez.model.User;
import com.vibez.repository.UserRepository;
import com.vibez.service.InAppNotificationService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class InAppNotificationController {


    private final UserRepository userRepository;
    private final InAppNotificationService notificationService;

    public InAppNotificationController(UserRepository userRepository, InAppNotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }


    @GetMapping
    public ResponseEntity<List<InAppNotificationDto>> getMyNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        List<InAppNotificationDto> notifications = notificationService.getNotificationsForUser(currentUser);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        long count = notificationService.getUnreadCount(currentUser);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(count);
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        notificationService.markAllAsRead(currentUser);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markOneAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);
        notificationService.markAsRead(notificationId, currentUser);
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Brak autoryzacji");
        }

        String username = userDetails.getUsername();
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nieprawidłowy token");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika dla zasady: " + username));
    }
}