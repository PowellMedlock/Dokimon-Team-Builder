package com.example.dokimon.model;
//Defines whether a Dokimon is weak to, resistant to or immune to a certain type
public record Effectiveness(String type, double multiplier, String category) {}