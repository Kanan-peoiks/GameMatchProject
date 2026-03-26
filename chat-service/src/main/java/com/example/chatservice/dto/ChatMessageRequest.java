package com.example.chatservice.dto;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String roomCode;
    private String content;
}
