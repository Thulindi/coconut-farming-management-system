package com.coconutfarming.plantation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class HarvestResponse {
    private Long id;
    private Long landId;
    private LocalDate harvestDate;
    private String season;
    private Integer totalCoconuts;
    private BigDecimal income;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HarvestResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLandId() {
        return landId;
    }

    public void setLandId(Long landId) {
        this.landId = landId;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
