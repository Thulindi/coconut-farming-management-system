package com.coconutfarming.plantation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class HarvestRequest {
    @NotNull
    private LocalDate harvestDate;

    @NotBlank
    private String season;

    @NotNull
    @Min(0)
    private Integer totalCoconuts;

    private BigDecimal income;
    private String notes;

    public HarvestRequest() {}

    public LocalDate getHarvestDate() {
        return harvestDate;
    }

    public void setHarvestDate(LocalDate harvestDate) {
        this.harvestDate = harvestDate;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public Integer getTotalCoconuts() {
        return totalCoconuts;
    }

    public void setTotalCoconuts(Integer totalCoconuts) {
        this.totalCoconuts = totalCoconuts;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
