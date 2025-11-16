package com.vibez.repository;

import com.vibez.model.ChatParticipant;
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
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    Optional<ChatParticipant> findByUserAndChatRoom(User user, ChatRoom chatRoom);
    List<ChatParticipant> findByChatRoom_Id(UUID chatRoomId);
    List<ChatParticipant> findByUser_Username(String username);

    @Query("SELECT cp FROM ChatParticipant cp JOIN FETCH cp.user u WHERE cp.chatRoom.id = :chatRoomId")
    List<ChatParticipant> findByChatRoom_IdWithUser(@Param("chatRoomId") UUID chatRoomId);
}