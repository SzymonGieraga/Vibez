package com.vibez.repository;

import com.vibez.model.ChatRoom;
import com.vibez.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    List<ChatRoom> findByParticipants_User_Username(String username);

    @Query("SELECT cr FROM ChatRoom cr " +
            "WHERE cr.type = com.vibez.model.types.ChatRoomType.PRIVATE " +
            "AND cr.id IN (SELECT p.chatRoom.id FROM ChatParticipant p WHERE p.user = :user1) " +
            "AND cr.id IN (SELECT p.chatRoom.id FROM ChatParticipant p WHERE p.user = :user2) " +
            "AND (SELECT COUNT(p) FROM ChatParticipant p WHERE p.chatRoom.id = cr.id) = 2")
    Optional<ChatRoom> findPrivateChatRoomByUsers(@Param("user1") User user1, @Param("user2") User user2);

}