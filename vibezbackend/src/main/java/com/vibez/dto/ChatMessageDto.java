package com.vibez.dto;

import com.vibez.model.ChatMessage;
import java.time.LocalDateTime;
import java.util.UUID;

public class ChatMessageDto {
    private UUID id;
    private UUID chatRoomId;
    private String content;
    private LocalDateTime timestamp;
    private boolean isEdited;
    private UserSimpleDto sender;
    private ReelSimpleDto reel;

    public ChatMessageDto(ChatMessage message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.timestamp = message.getTimestamp();
        this.isEdited = message.isEdited();
        this.sender = new UserSimpleDto(message.getSender());
        this.reel = (message.getReel() != null) ? new ReelSimpleDto(message.getReel()) : null;
        this.chatRoomId = message.getChatRoom().getId();
    }
    public UUID getId() {return id;}
    public void setId(UUID id) {this.id = id;}
    public String getContent() {return content;}
    public void setContent(String content) {this.content = content;}
    public LocalDateTime getTimestamp() {return timestamp;}
    public void setTimestamp(LocalDateTime timestamp) {this.timestamp = timestamp;}
    public boolean isEdited() {return isEdited;}
    public void setEdited(boolean edited) {this.isEdited = edited;}
    public UserSimpleDto getSender() {return sender;}
    public void setSender(UserSimpleDto sender) {this.sender = sender;}
    public ReelSimpleDto getReel() {return reel;}
    public void setReel(ReelSimpleDto reel) {this.reel = reel;}
    public UUID getChatRoomId() {return chatRoomId;}
    public void setChatRoomId(UUID chatRoomId) {this.chatRoomId = chatRoomId;}

}