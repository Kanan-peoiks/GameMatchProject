package com.example.chatservice.repo;

import com.example.chatservice.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepo extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomCodeOrderBySentAtAsc(String roomCode);
}
