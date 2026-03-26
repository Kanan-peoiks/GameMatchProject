package com.example.roomservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;  // RoomType code

    private String title;
    private String description;
    private boolean active;
}