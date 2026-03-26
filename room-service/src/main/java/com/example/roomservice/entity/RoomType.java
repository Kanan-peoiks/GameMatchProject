package com.example.roomservice.entity;

import lombok.Getter;
import lombok.Setter;

@Getter
public enum RoomType {
    GENERAL_CHAT("GENERAL_CHAT"),
    GAME_ROOM("GAME_ROOM"),
    LANGUAGE_ROOM("LANGUAGE_ROOM");

    private final String code;

    RoomType(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}