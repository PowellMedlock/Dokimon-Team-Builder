package com.example.dokimon.model;
import lombok.*;
import java.util.List;

/*Defines the response to all analysis for a Dokimon in the service layer, showing all the type matchups,
    and how many types it is resistant/immune to hand how many types it's weak to*/

@Data @AllArgsConstructor
public class TeamAnalysisResponse {
    private List<Dokimon> team;
    private List<TypeRow> rows;

    @Data @AllArgsConstructor
    public static class TypeRow {
        private String type;
        private List<Effectiveness> matchups;
        private int weakCount;
        private int resistantOrImmuneCount;
    }
}