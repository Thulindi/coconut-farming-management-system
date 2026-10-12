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
@Table(name = "harvest_records", indexes = {
    @Index(name = "idx_harvest_land", columnList = "land_id"),
    @Index(name = "idx_harvest_date", columnList = "harvest_date"),
    @Index(name = "idx_harvest_season", columnList = "season")
})
public class HarvestRecord extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_id", nullable = false)
    private Land land;

    @Column(name = "harvest_date", nullable = false)
    private LocalDate harvestDate;

    @Column(name = "season", nullable = false, length = 40)
    private String season;

    @Column(name = "total_coconuts", nullable = false)
    private Integer totalCoconuts;

    @Column(name = "income", precision = 12, scale = 2)
    private BigDecimal income;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "financial_record_id")
    private Long financialRecordId;

    public HarvestRecord() {}

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

    public Long getFinancialRecordId() {
        return financialRecordId;
    }

    public void setFinancialRecordId(Long financialRecordId) {
        this.financialRecordId = financialRecordId;
    }
}
