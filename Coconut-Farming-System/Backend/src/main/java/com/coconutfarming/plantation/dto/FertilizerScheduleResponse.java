package com.coconutfarming.plantation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.coconutfarming.plantation.model.Frequency;
import com.coconutfarming.plantation.model.ScheduleStatus;

public class FertilizerScheduleResponse {
    private Long id;
    private Long landId;
    private String fertilizerType;
    private Frequency frequency;
    private BigDecimal recommendedQuantity;
    private LocalDate nextDueDate;
    private String applicationMethod;
    private String notes;
    private ScheduleStatus status;
    private LocalDate lastAppliedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FertilizerScheduleResponse() {}

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

    public String getFertilizerType() {
        return fertilizerType;
    }

    public void setFertilizerType(String fertilizerType) {
        this.fertilizerType = fertilizerType;
    }

    public Frequency getFrequency() {
        return frequency;
    }

    public void setFrequency(Frequency frequency) {
        this.frequency = frequency;
    }

    public BigDecimal getRecommendedQuantity() {
        return recommendedQuantity;
    }

    public void setRecommendedQuantity(BigDecimal recommendedQuantity) {
        this.recommendedQuantity = recommendedQuantity;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public String getApplicationMethod() {
        return applicationMethod;
    }

    public void setApplicationMethod(String applicationMethod) {
        this.applicationMethod = applicationMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public ScheduleStatus getStatus() {
        return status;
    }

    public void setStatus(ScheduleStatus status) {
        this.status = status;
    }

    public LocalDate getLastAppliedDate() {
        return lastAppliedDate;
    }

    public void setLastAppliedDate(LocalDate lastAppliedDate) {
        this.lastAppliedDate = lastAppliedDate;
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
