package com.coconutfarming.plantation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FertilizerApplicationRequest {
    @NotNull
    private LocalDate appliedDate;

    @NotBlank
    private String fertilizerType;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    private BigDecimal quantityUsed;

    private String remarks;

    public FertilizerApplicationRequest() {}

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public String getFertilizerType() {
        return fertilizerType;
    }

    public void setFertilizerType(String fertilizerType) {
        this.fertilizerType = fertilizerType;
    }

    public BigDecimal getQuantityUsed() {
        return quantityUsed;
    }

    public void setQuantityUsed(BigDecimal quantityUsed) {
        this.quantityUsed = quantityUsed;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
