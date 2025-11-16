package com.vibez.dto;

import com.vibez.model.ChatParticipant;
import com.vibez.model.ChatRoom;
import com.vibez.model.types.ChatRoomType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ChatRoomDto {
    private UUID id;
    private ChatRoomType type;
    private String name;
    private LocalDateTime createdAt;
    private List<UserSimpleDto> participants;
    private ChatMessageDto lastMessage;

    public ChatRoomDto(ChatRoom room, ChatMessageDto lastMessage) {
        this.id = room.getId();
        this.type = room.getType();
        this.name = room.getName();
        this.createdAt = room.getCreatedAt();
        this.participants = room.getParticipants().stream()
                .map(ChatParticipant::getUser)
                .map(UserSimpleDto::new)
                .collect(Collectors.toList());
        this.lastMessage = lastMessage;
    }

    public UUID getId() {return id;}
    public void setId(UUID id) {this.id = id;}
    public ChatRoomType getType() {return type;}
    public void setType(ChatRoomType type) {this.type = type;}
    public String getName() {return name;}
    public void setName(String name) {this.name = name;}
    public LocalDateTime getCreatedAt() {return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
    public List<UserSimpleDto> getParticipants() {return participants;}
    public void setParticipants(List<UserSimpleDto> participants) {this.participants = participants;}
    public ChatMessageDto getLastMessage() {return lastMessage;}
    public void setLastMessage(ChatMessageDto lastMessage) {this.lastMessage = lastMessage;}

}