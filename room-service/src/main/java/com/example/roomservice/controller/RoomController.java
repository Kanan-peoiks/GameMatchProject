package com.example.roomservice.controller;


import com.example.roomservice.dto.RoomResponse;
import com.example.roomservice.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{code}")
    public ResponseEntity<RoomResponse> getRoomByCode(@PathVariable String code) {
        return ResponseEntity.ok(roomService.getRoomByCode(code));
    }
}