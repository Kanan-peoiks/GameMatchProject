package com.example.roomservice.service;

import com.example.roomservice.dto.RoomResponse;
import com.example.roomservice.entity.Room;
import com.example.roomservice.entity.RoomType;
import com.example.roomservice.repository.RoomRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    // Default 3 room Üçündü bura
    @PostConstruct
    public void initDefaultRooms() {
        createIfNotExists(RoomType.GENERAL_CHAT, "General Chat", "Ümumi söhbət otağı");
        createIfNotExists(RoomType.GAME_ROOM, "Game Room", "Oyun təklifləri və oyun söhbəti üçün otaq");
        createIfNotExists(RoomType.LANGUAGE_ROOM, "Language Room", "Dil öyrənmə və taktika paylaşımı üçün otaq");
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public RoomResponse getRoomByCode(String code) {
        Room room = roomRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Room not found: " + code));
        return toResponse(room);
    }

    private void createIfNotExists(RoomType type, String title, String description) {
        if (!roomRepository.existsByCode(type.getCode())) {
            Room room = new Room();
            room.setCode(type.getCode());
            room.setTitle(title);
            room.setDescription(description);
            room.setActive(true);
            roomRepository.save(room);
        }
    }

    private RoomResponse toResponse(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getCode(),
                room.getTitle(),
                room.getDescription(),
                room.isActive()
        );
    }
}