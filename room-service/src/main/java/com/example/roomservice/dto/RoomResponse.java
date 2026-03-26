package com.example.roomservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RoomResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private boolean active;
}