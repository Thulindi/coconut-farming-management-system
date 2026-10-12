package com.coconutfarming.plantation.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Index;

@Entity
@Table(name = "lands", indexes = {
        @Index(name = "idx_lands_farmer", columnList = "farmer_id")
})
public class Land extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "location_name", nullable = false, length = 120)
    private String locationName;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "area_in_acres", nullable = false, precision = 10, scale = 2)
    private BigDecimal areaInAcres;

    @Column(name = "number_of_trees", nullable = false)
    private Integer numberOfTrees;

    @Column(name = "coconut_variety", length = 120)
    private String coconutVariety;

    @Column(name = "soil_type", length = 120)
    private String soilType;

    @Column(name = "irrigation_type", length = 120)
    private String irrigationType;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LandStatus status = LandStatus.ACTIVE;

    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "latitude", precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 6)
    private BigDecimal longitude;

    @OneToMany(mappedBy = "land", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FertilizerSchedule> schedules = new ArrayList<>();

    @OneToMany(mappedBy = "land", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HarvestRecord> harvestRecords = new ArrayList<>();

    public Land() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public BigDecimal getAreaInAcres() {
        return areaInAcres;
    }

    public void setAreaInAcres(BigDecimal areaInAcres) {
        this.areaInAcres = areaInAcres;
    }

    public Integer getNumberOfTrees() {
        return numberOfTrees;
    }

    public void setNumberOfTrees(Integer numberOfTrees) {
        this.numberOfTrees = numberOfTrees;
    }

    public String getCoconutVariety() {
        return coconutVariety;
    }

    public void setCoconutVariety(String coconutVariety) {
        this.coconutVariety = coconutVariety;
    }

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }

    public String getIrrigationType() {
        return irrigationType;
    }

    public void setIrrigationType(String irrigationType) {
        this.irrigationType = irrigationType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LandStatus getStatus() {
        return status;
    }

    public void setStatus(LandStatus status) {
        this.status = status;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public List<FertilizerSchedule> getSchedules() {
        return schedules;
    }

    public void setSchedules(List<FertilizerSchedule> schedules) {
        this.schedules = schedules;
    }

    public List<HarvestRecord> getHarvestRecords() {
        return harvestRecords;
    }

    public void setHarvestRecords(List<HarvestRecord> harvestRecords) {
        this.harvestRecords = harvestRecords;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }
}
