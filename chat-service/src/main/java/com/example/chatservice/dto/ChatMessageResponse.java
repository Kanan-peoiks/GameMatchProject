package com.example.chatservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private String roomCode;
    private String sender;
    private String content;
    private LocalDateTime sentAt;
}