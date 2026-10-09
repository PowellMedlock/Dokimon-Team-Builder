package com.example.dokimon.service;

import com.example.dokimon.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TypeEffectivenessService {
    // List of types in the game
    public static final List<String> TYPES = List.of(
        "Fire","Grass","Water","Electric","Dark","Light","Flying",
        "Fight","Poison","Dragon","Fairy","Ghost","Ice"
    );
    //create the type effectiveness chart as Map variable CHART
    private static final Map<String, Map<String, Double>> CHART = buildChart();
    private final DokimonRepository repository;

    //gets all Dokimon from dokimon.json
    public List<Dokimon> getAllDokimon() { return repository.findAll(); }
    //
    public TeamAnalysisResponse analyze(List<String> names) {
        List<Dokimon> team = names.stream().map(repository::findByName).toList();

        List<TeamAnalysisResponse.TypeRow> rows = TYPES.stream()
            .map(type -> buildRow(type, team))
            .toList();

        return new TeamAnalysisResponse(team, rows);
    }
    //creates a row based on a type from Dokimon quest including what the Dokimon is weak, resistant or immune to
    private TeamAnalysisResponse.TypeRow buildRow(String attackType, List<Dokimon> team) {
        List<Effectiveness> matchups = team.stream()
            .map(d -> {
                double multiplier = multiplierAgainst(attackType, d);
                return new Effectiveness(d.getName(), multiplier, category(multiplier));
            }).toList();

        int weak = (int) matchups.stream().filter(m -> m.multiplier() > 1.0).count();
        int resistant = (int) matchups.stream().filter(m -> m.multiplier() < 1.0).count();

        return new TeamAnalysisResponse.TypeRow(attackType, matchups, weak, resistant);
    }
    // calculates how effective a type is hitting the Dokimon
    private double multiplierAgainst(String attackType, Dokimon defender) {
        double result = 1.0;
        for (String defenderType : defender.getTypes()) {
            result *= CHART.get(attackType).get(defenderType);
        }
        return result;
    }
    // every weakness/resistance/immunity definition
    private String category(double m) {
        if (m == 0.0) return "IMMUNE";
        if (m == 0.25) return "RESIST_1_4";
        if (m == 0.5) return "RESIST_1_2";
        if (m == 1.0) return "NEUTRAL";
        if (m == 2.0) return "WEAK_2";
        if (m == 4.0) return "WEAK_4";
        return "OTHER";
    }
    // builds the type effectiveness chat to show which types are weak, resistant or immune to another type
    private static Map<String, Map<String, Double>> buildChart() {
        double[][] values = {
            {1,2,.5,1,1,1,1,1,1,1,.5,1,2},
            {.5,1,2,2,1,2,.5,1,.5,1,1,1,.5},
            {2,.5,1,.5,1,1,1,1,2,1,1,1,.5},
            {1,.5,2,.5,1,1,2,1,.5,1,1,1,.5},
            {2,1,1,2,1,.5,1,1,1,1,.5,1,1},
            {1,.5,1,.5,2,1,1,1,1,.5,2,1,1},
            {1,2,1,.5,.5,1,1,2,1,1,1,1,.5},
            {1,1,1,1,.5,.5,.5,1,1,1,1,0,2},
            {1,2,1,1,1,1,1,.5,.5,1,2,1,0},
            {1,1,1,1,1,1,1,1,1,2,.5,1,.5},
            {2,1,1,1,1,.5,1,1,2,2,.5,1,1},
            {1,1,1,1,1,1,1,.5,1,1,2,2,1},
            {.5,2,.5,.5,1,1,2,1,1,2,1,.5,.5}
        };

        Map<String, Map<String, Double>> chart = new LinkedHashMap<>();
        for (int r = 0; r < TYPES.size(); r++) {
            Map<String, Double> row = new LinkedHashMap<>();
            for (int c = 0; c < TYPES.size(); c++) row.put(TYPES.get(c), values[r][c]);
            chart.put(TYPES.get(r), row);
        }
        return chart;
    }
}