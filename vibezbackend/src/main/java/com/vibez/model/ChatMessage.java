package com.vibez.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    @JsonBackReference("room-messages")
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonBackReference("user-messages")
    private User sender;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String content;

   @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reel_id", nullable = true)
    private Reel reel;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_edited",nullable = false)
    private boolean isEdited = false;

    public ChatMessage() {}

    @PrePersist
    protected void onSend() {
        this.timestamp = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ChatRoom getChatRoom() { return chatRoom; }
    public void setChatRoom(ChatRoom chatRoom) { this.chatRoom = chatRoom; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Reel getReel() { return reel; }
    public void setReel(Reel reel) { this.reel = reel; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public boolean isEdited() { return isEdited; }
    public void setEdited(boolean edited) { this.isEdited = edited; }
}