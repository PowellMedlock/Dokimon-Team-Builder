package com.example.dokimon.service;
import com.example.dokimon.model.Dokimon;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;
import java.io.IOException;
import java.util.List;

@Repository
public class DokimonRepository {
    private final List<Dokimon> dokimon;
    // Loads the dokimon.json into a list
    public DokimonRepository(ObjectMapper mapper) {
        try {
            dokimon = mapper.readValue(
                new ClassPathResource("dokimon.json").getInputStream(),
                new TypeReference<List<Dokimon>>() {}
            );
        } catch (IOException e) {
            throw new IllegalStateException("Could not load dokimon.json", e);
        }
    }
    //finds all Dokimon in dokimon.json
    public List<Dokimon> findAll() { return dokimon; }
    //finds a Dokimon in dokimon.json based on the name in the input
    public Dokimon findByName(String name) {
        return dokimon.stream()
            .filter(d -> d.getName().equalsIgnoreCase(name.trim()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown Dokimon: " + name));
    }
}