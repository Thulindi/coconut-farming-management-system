package com.coconutfarming.plantation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.coconutfarming.plantation.model.Frequency;
import com.coconutfarming.plantation.model.ScheduleStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FertilizerScheduleRequest {
    @NotBlank
    private String fertilizerType;

    @NotNull
    private Frequency frequency;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    private BigDecimal recommendedQuantity;

    @NotNull
    private LocalDate nextDueDate;

    private String applicationMethod;
    private String notes;
    private ScheduleStatus status = ScheduleStatus.ACTIVE;

    public FertilizerScheduleRequest() {}

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
}
