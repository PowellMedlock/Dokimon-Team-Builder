package com.example.dokimon.controller;
import com.example.dokimon.model.*;
import com.example.dokimon.service.TypeEffectivenessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins="*")
public class TeamBuilderController {
    private final TypeEffectivenessService service;

    // gets a request from the frontend app function and sends it to the function getAllDokimon in TypeEffectivenessService
    @GetMapping("/dokimon")
    public List<Dokimon> getDokimon() { return service.getAllDokimon(); }

    // gets a request from the frontend app function and sends it to the
    @PostMapping("/team-builder/analyze")
    public TeamAnalysisResponse analyze(@Valid @RequestBody TeamRequest request) {
        return service.analyze(request.getDokimon());
    }
}