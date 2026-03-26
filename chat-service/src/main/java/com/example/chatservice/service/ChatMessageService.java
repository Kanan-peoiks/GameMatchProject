package com.example.chatservice.service;


import com.example.chatservice.dto.ChatMessageRequest;
import com.example.chatservice.dto.ChatMessageResponse;
import com.example.chatservice.entity.ChatMessage;
import com.example.chatservice.repo.ChatMessageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepo chatMessageRepository;

    public ChatMessageResponse saveMessage(ChatMessageRequest request, String sender) {
        ChatMessage message = new ChatMessage();
        message.setRoomCode(request.getRoomCode());
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setSentAt(LocalDateTime.now());

        ChatMessage saved = chatMessageRepository.save(message);
        return toResponse(saved);
    }

    public List<ChatMessageResponse> getMessagesByRoomCode(String roomCode) {
        return chatMessageRepository.findByRoomCodeOrderBySentAtAsc(roomCode)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ChatMessageResponse toResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getRoomCode(),
                message.getSender(),
                message.getContent(),
                message.getSentAt()
        );
    }
}