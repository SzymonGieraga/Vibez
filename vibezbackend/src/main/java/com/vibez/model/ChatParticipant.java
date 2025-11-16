package com.vibez.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.vibez.model.types.ParticipantRole;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_participants")
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-participants")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    @JsonBackReference("room-participants")
    private ChatRoom chatRoom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipantRole role = ParticipantRole.MEMBER;

    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    private LocalDateTime lastReadTimestamp;

    public ChatParticipant() {}

    public ChatParticipant(User user, ChatRoom chatRoom, ParticipantRole role) {
        this.user = user;
        this.chatRoom = chatRoom;
        this.role = role;
    }

    @PrePersist
    protected void onJoin() {
        this.joinedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public ChatRoom getChatRoom() { return chatRoom; }
    public void setChatRoom(ChatRoom chatRoom) { this.chatRoom = chatRoom; }
    public ParticipantRole getRole() { return role; }
    public void setRole(ParticipantRole role) { this.role = role; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    public LocalDateTime getLastReadTimestamp() { return lastReadTimestamp; }
    public void setLastReadTimestamp(LocalDateTime lastReadTimestamp) { this.lastReadTimestamp = lastReadTimestamp; }
}