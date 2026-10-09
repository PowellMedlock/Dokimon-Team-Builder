package com.example.dokimon.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class TeamRequest {

    @NotNull
    @Size(
            min = 1,
            max = 6,
            message = "Between 1 and 6 Dokimon are required."
    )
    private List<String> dokimon;
}