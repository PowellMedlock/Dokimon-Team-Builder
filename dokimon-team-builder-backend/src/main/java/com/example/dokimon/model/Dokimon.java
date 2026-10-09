package com.example.dokimon.model;
import lombok.*;
import java.util.List;

//class representing each individual Dokimon
@Data @NoArgsConstructor @AllArgsConstructor
public class Dokimon {
    private int number;
    private String name;
    private List<String> types;
}