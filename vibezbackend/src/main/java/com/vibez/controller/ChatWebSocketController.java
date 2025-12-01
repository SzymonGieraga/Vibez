package com.vibez.controller;

import com.vibez.dto.ChatMessageDto;
import com.vibez.model.ChatMessage;
import com.vibez.model.User;
import com.vibez.repository.UserRepository;
import com.vibez.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Controller
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate,
                                   ChatService chatService,
                                   UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat/{chatId}/send")
    public void handleChatMessage(
            @DestinationVariable UUID chatId,
            @Payload ChatMessageRequestDto messageDto,
            Principal principal) {

        User sender = getCurrentUser(principal);
        ChatMessage savedMessage = chatService.saveMessage(
                chatId,
                sender,
                messageDto.getContent(),
                messageDto.getReelId()
        );

        ChatMessageDto responseDto = new ChatMessageDto(savedMessage);

        List<User> participants = chatService.getChatParticipants(chatId);

        for (User participant : participants) {
            messagingTemplate.convertAndSendToUser(
                    participant.getUsername(),
                    "/queue/chat-messages",
                    responseDto
            );
        }
    }


    @MessageMapping("/chat/edit")
    public void handleEditMessage(@Payload EditMessageStompDto dto, Principal principal) {
        User editor = getCurrentUser(principal);
        chatService.editMessage(
                dto.getMessageId(),
                dto.getNewContent(),
                editor
        );
    }

    @MessageMapping("/chat/delete")
    public void handleDeleteMessage(@Payload DeleteMessageStompDto dto, Principal principal) {
        User deleter = getCurrentUser(principal);

        chatService.deleteMessage(dto.getMessageId(), deleter);
    }


    private User getCurrentUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Brak autoryzacji");
        }
        String username = principal.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono użytkownika: " + username));
    }

    static class ChatMessageRequestDto {
        private String content;
        private Long reelId;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Long getReelId() { return reelId; }
        public void setReelId(Long reelId) { this.reelId = reelId; }
    }

    static class EditMessageStompDto {
        private UUID messageId;
        private String newContent;

        public UUID getMessageId() { return messageId; }
        public void setMessageId(UUID messageId) { this.messageId = messageId; }
        public String getNewContent() { return newContent; }
        public void setNewContent(String newContent) { this.newContent = newContent; }
    }

    static class DeleteMessageStompDto {
        private UUID messageId;

        public UUID getMessageId() { return messageId; }
        public void setMessageId(UUID messageId) { this.messageId = messageId; }
    }
}