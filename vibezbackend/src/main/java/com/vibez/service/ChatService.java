package com.vibez.service;

import com.vibez.dto.ChatMessageDto;
import com.vibez.dto.ChatRoomDto;
import com.vibez.model.*;
import com.vibez.model.types.ChatRoomType;
import com.vibez.model.types.ParticipantRole;
import com.vibez.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final UserRepository userRepository;
    private final ReelRepository reelRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ChatService(ChatRoomRepository chatRoomRepository,
                       ChatMessageRepository chatMessageRepository,
                       ChatParticipantRepository chatParticipantRepository,
                       UserRepository userRepository,
                       ReelRepository reelRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.userRepository = userRepository;
        this.reelRepository = reelRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(readOnly = true)
    public List<ChatRoomDto> getChatRoomsForUser(User user) {
        List<ChatRoom> rooms = chatRoomRepository.findByParticipants_User_Username(user.getUsername());

        return rooms.stream()
                .map(this::toChatRoomDto)
                .collect(Collectors.toList());
    }

    public ChatRoomDto getOrCreatePrivateChat(User user1, String otherUsername) {
        User user2 = userRepository.findByUsername(otherUsername)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + otherUsername));

        if (user1.getUsername().equals(otherUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nie można utworzyć czatu z samym sobą.");
        }

        ChatRoom room = chatRoomRepository.findPrivateChatRoomByUsers(user1, user2)
                .orElseGet(() -> {
                    ChatRoom newChatRoom = new ChatRoom();
                    newChatRoom.setType(ChatRoomType.PRIVATE);

                    Set<ChatParticipant> participants = new HashSet<>();
                    participants.add(new ChatParticipant(user1, newChatRoom, ParticipantRole.MEMBER));
                    participants.add(new ChatParticipant(user2, newChatRoom, ParticipantRole.MEMBER));
                    newChatRoom.setParticipants(participants);

                    return chatRoomRepository.save(newChatRoom);
                });

        return toChatRoomDto(room);
    }

    public ChatRoomDto createGroupChat(User creator, List<String> participantUsernames, String chatName) {
        ChatRoom newChatRoom = new ChatRoom();
        newChatRoom.setType(ChatRoomType.GROUP);
        newChatRoom.setName(chatName);

        Set<ChatParticipant> participants = new HashSet<>();
        participants.add(new ChatParticipant(creator, newChatRoom, ParticipantRole.ADMIN));

        for (String username : participantUsernames) {
            if (!username.equals(creator.getUsername())) {
                User member = userRepository.findByUsername(username)
                        .orElseThrow(() -> new EntityNotFoundException("Participant not found: " + username));
                participants.add(new ChatParticipant(member, newChatRoom, ParticipantRole.MEMBER));
            }
        }

        newChatRoom.setParticipants(participants);
        ChatRoom savedRoom = chatRoomRepository.save(newChatRoom);
        return toChatRoomDto(savedRoom);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageDto> getChatMessages(UUID chatRoomId, User user, Pageable pageable) {
        checkUserParticipation(chatRoomId, user);

        Page<ChatMessage> messages = chatMessageRepository.findByChatRoom_Id(chatRoomId, pageable);
        return messages.map(this::toChatMessageDto);
    }

    public ChatMessage saveMessage(UUID chatRoomId, User sender, String content, Long reelId) {

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new EntityNotFoundException("ChatRoom not found: " + chatRoomId));

        chatParticipantRepository.findByUserAndChatRoom(sender, chatRoom)
                .orElseThrow(() -> new AccessDeniedException("User is not a participant of this chat room"));

        Reel sharedReel = null;
        if (reelId != null) {
            sharedReel = reelRepository.findById(reelId)
                    .orElseThrow(() -> new EntityNotFoundException("Reel not found: " + reelId));
        }

        ChatMessage message = new ChatMessage();
        message.setChatRoom(chatRoom);
        message.setSender(sender);
        message.setContent(content);
        message.setReel(sharedReel);

        return chatMessageRepository.save(message);
    }

    public ChatMessageDto editMessage(UUID messageId, String newContent, User editor) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new EntityNotFoundException("Message not found: " + messageId));

        if (!message.getSender().getId().equals(editor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak uprawnień do edycji tej wiadomości.");
        }

        message.setContent(newContent);
        message.setEdited(true);
        ChatMessage updatedMessage = chatMessageRepository.save(message);

        // Wysyłamy powiadomienie o edycji
        broadcastEdit(updatedMessage);

        return toChatMessageDto(updatedMessage);
    }

    public ChatMessageDto deleteMessage(UUID messageId, User deleter) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new EntityNotFoundException("Message not found: " + messageId));

        if (!message.getSender().getId().equals(deleter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak uprawnień do usunięcia tej wiadomości.");
        }

        message.setContent("[Wiadomość usunięta]");
        message.setReel(null);
        message.setEdited(false);

        ChatMessage deletedMessage = chatMessageRepository.save(message);

        broadcastDelete(deletedMessage);

        return toChatMessageDto(deletedMessage);
    }

    private void broadcastEdit(ChatMessage message) {
        List<User> participants = getChatParticipants(message.getChatRoom().getId());
        ChatMessageDto messageDto = toChatMessageDto(message);

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "EDIT");
        payload.put("chatRoomId", message.getChatRoom().getId());
        payload.put("message", messageDto);

        sendToParticipants(participants, payload);
    }

    private void broadcastDelete(ChatMessage message) {
        List<User> participants = getChatParticipants(message.getChatRoom().getId());
        ChatMessageDto messageDto = toChatMessageDto(message);

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "DELETE");
        payload.put("chatRoomId", message.getChatRoom().getId());
        payload.put("message", messageDto);

        sendToParticipants(participants, payload);
    }

    private void sendToParticipants(List<User> participants, Map<String, Object> payload) {
        for (User participant : participants) {
            messagingTemplate.convertAndSendToUser(
                    participant.getUsername(),
                    "/queue/chat-updates",
                    payload
            );
        }
    }



    @Transactional(readOnly = true)
    public List<User> getChatParticipants(UUID chatRoomId) {
        List<ChatParticipant> participants = chatParticipantRepository.findByChatRoom_IdWithUser(chatRoomId);
        return participants.stream()
                .map(ChatParticipant::getUser)
                .collect(Collectors.toList());
    }

    private void checkUserParticipation(UUID chatRoomId, User user) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ChatRoom not found: " + chatRoomId));

        chatParticipantRepository.findByUserAndChatRoom(user, chatRoom)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak dostępu do tego czatu."));
    }

    private void broadcastUpdate(ChatMessage message, String updateType) {
        List<User> participants = getChatParticipants(message.getChatRoom().getId());
        ChatMessageDto messageDto = toChatMessageDto(message);

        Map<String, Object> payload = Map.of(
                "type", updateType,
                "message", messageDto
        );

        for (User participant : participants) {
            messagingTemplate.convertAndSendToUser(
                    participant.getUsername(),
                    "/queue/chat-updates",
                    payload
            );
        }
    }

    private ChatMessageDto toChatMessageDto(ChatMessage message) {
        return new ChatMessageDto(message);
    }

    private ChatRoomDto toChatRoomDto(ChatRoom room) {
        ChatMessageDto lastMessageDto = chatMessageRepository.findFirstByChatRoom_IdOrderByTimestampDesc(room.getId())
                .map(this::toChatMessageDto)
                .orElse(null);

        return new ChatRoomDto(room, lastMessageDto);
    }

    public void notifyNewMessage(UUID chatRoomId, ChatMessageDto messageDto) {
        List<User> participants = getChatParticipants(chatRoomId);
        for (User participant : participants) {
            messagingTemplate.convertAndSendToUser(
                    participant.getUsername(),
                    "/queue/chat-messages",
                    messageDto
            );
        }
    }
}