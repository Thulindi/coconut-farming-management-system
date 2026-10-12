package com.coconutfarming.plantation.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "fertilizer_schedules", indexes = {
    @Index(name = "idx_schedule_land", columnList = "land_id"),
    @Index(name = "idx_schedule_next_due", columnList = "next_due_date")
})
public class FertilizerSchedule extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_id", nullable = false)
    private Land land;

    @Column(name = "fertilizer_type", nullable = false, length = 120)
    private String fertilizerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false)
    private Frequency frequency;

    @Column(name = "recommended_quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal recommendedQuantity;

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @Column(name = "application_method", length = 200)
    private String applicationMethod;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ScheduleStatus status = ScheduleStatus.ACTIVE;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FertilizerApplication> applications = new ArrayList<>();

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FertilizerScheduleChangeLog> changeLogs = new ArrayList<>();

    public FertilizerSchedule() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Land getLand() {
        return land;
    }

    public void setLand(Land land) {
        this.land = land;
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

    public List<FertilizerApplication> getApplications() {
        return applications;
    }

    public void setApplications(List<FertilizerApplication> applications) {
        this.applications = applications;
    }

    public List<FertilizerScheduleChangeLog> getChangeLogs() {
        return changeLogs;
    }

    public void setChangeLogs(List<FertilizerScheduleChangeLog> changeLogs) {
        this.changeLogs = changeLogs;
    }
}
