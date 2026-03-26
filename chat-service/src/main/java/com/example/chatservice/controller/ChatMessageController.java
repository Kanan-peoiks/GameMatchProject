package com.example.chatservice.controller;

import com.example.chatservice.dto.ChatMessageRequest;
import com.example.chatservice.dto.ChatMessageResponse;
import com.example.chatservice.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatService;

    @PostMapping
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @RequestBody ChatMessageRequest request,
            @RequestHeader("sender") String sender) {
        return ResponseEntity.ok(chatService.saveMessage(request, sender));
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable String roomCode) {
        return ResponseEntity.ok(chatService.getMessagesByRoomCode(roomCode));
    }
}