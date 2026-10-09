# Dokimon Quest Team Builder Backend

Spring Boot 3.5 + Spring Web + Lombok + Java 21.

## Endpoints

`GET /api/dokimon` — returns all 144 Dokimon and their types.

`POST /api/team-builder/analyze` — accepts exactly six names and returns the six selected Dokimon plus one row for each of the 13 types.

Request:
```json
{"dokimon":["Burnsby","Bulbapod","Squibbly","Furreal","Casper","Haracker"]}
```

Each matchup has:
- `multiplier`: 0, 0.25, 0.5, 1, 2, or 4
- `category`: IMMUNE, RESIST_1_4, RESIST_1_2, NEUTRAL, WEAK_2, WEAK_4

Each type row also has:
- `weakCount`: number of team members with multiplier > 1
- `resistantOrImmuneCount`: number with multiplier < 1

The six team positions are preserved, making the response directly usable as frontend columns.

## Run
```bash
mvn spring-boot:run
```
