package com.vibez.controller;

import com.vibez.dto.ChatMessageDto;
import com.vibez.dto.ChatRoomDto;
import com.vibez.model.User;
import com.vibez.repository.UserRepository;
import com.vibez.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
public class ChatRestController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @Autowired
    public ChatRestController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<ChatRoomDto>> getMyChatRooms(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        List<ChatRoomDto> rooms = chatService.getChatRoomsForUser(currentUser);
        return ResponseEntity.ok(rooms);
    }


    @PostMapping("/private")
    public ResponseEntity<ChatRoomDto> getOrCreatePrivateChat(@RequestBody Map<String, String> body, @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        String otherUsername = body.get("participantUsername");
        ChatRoomDto room = chatService.getOrCreatePrivateChat(currentUser, otherUsername);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/group")
    public ResponseEntity<ChatRoomDto> createGroupChat(@RequestBody GroupChatRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        ChatRoomDto room = chatService.createGroupChat(currentUser, request.participantUsernames, request.name);
        return ResponseEntity.status(201).body(room);
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<Page<ChatMessageDto>> getChatMessages(
            @PathVariable UUID chatId,
            @PageableDefault(size = 50, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);
        Page<ChatMessageDto> messages = chatService.getChatMessages(chatId, currentUser, pageable);
        return ResponseEntity.ok(messages);
    }


    @PatchMapping("/messages/{messageId}")
    public ResponseEntity<ChatMessageDto> editMessage(
            @PathVariable UUID messageId,
            @RequestBody EditMessageRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);
        ChatMessageDto updatedMessage = chatService.editMessage(
                messageId,
                request.getContent(),
                currentUser
        );
        return ResponseEntity.ok(updatedMessage);
    }


    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<ChatMessageDto> deleteMessage(
            @PathVariable UUID messageId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);
        ChatMessageDto deletedMessage = chatService.deleteMessage(messageId, currentUser);
        return ResponseEntity.ok(deletedMessage);
    }

    static class GroupChatRequest {
        public String name;
        public List<String> participantUsernames;
    }

    static class EditMessageRequestDto {
        private String content;
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono użytkownika: " + username));
    }
}