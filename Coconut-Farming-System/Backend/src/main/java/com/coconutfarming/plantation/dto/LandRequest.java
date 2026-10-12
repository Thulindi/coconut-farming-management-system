package com.coconutfarming.plantation.dto;

import java.math.BigDecimal;
import com.coconutfarming.plantation.model.LandStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LandRequest {
    @NotNull
    private Long farmerId;

    @NotBlank
    private String locationName;

    @NotBlank
    private String district;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    private BigDecimal areaInAcres;

    @NotNull
    @Min(0)
    private Integer numberOfTrees;

    private String coconutVariety;
    private String soilType;
    private String irrigationType;
    private String notes;
    private LandStatus status = LandStatus.ACTIVE;
    private BigDecimal latitude;
    private BigDecimal longitude;

    public LandRequest() {
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
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
