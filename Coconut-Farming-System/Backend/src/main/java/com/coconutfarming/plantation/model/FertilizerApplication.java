package com.coconutfarming.plantation.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "fertilizer_applications", indexes = {
    @Index(name = "idx_application_schedule", columnList = "schedule_id")
})
public class FertilizerApplication extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private FertilizerSchedule schedule;

    @Column(name = "applied_date", nullable = false)
    private LocalDate appliedDate;

    @Column(name = "fertilizer_type", nullable = false, length = 120)
    private String fertilizerType;

    @Column(name = "quantity_used", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityUsed;

    @Column(name = "remarks", length = 500)
    private String remarks;

    public FertilizerApplication() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FertilizerSchedule getSchedule() {
        return schedule;
    }

    public void setSchedule(FertilizerSchedule schedule) {
        this.schedule = schedule;
    }

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
