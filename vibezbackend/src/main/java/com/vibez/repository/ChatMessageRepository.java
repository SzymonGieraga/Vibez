package com.vibez.repository;

import com.vibez.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    Page<ChatMessage> findByChatRoom_Id(UUID chatRoomId, Pageable pageable);
    Optional<ChatMessage> findFirstByChatRoom_IdOrderByTimestampDesc(UUID chatRoomId);
}