package com.coconutfarming.financial.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "coconut_price_history")
public class CoconutPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "week_label", nullable = false)
    private String weekLabel;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "average_price", nullable = false)
    private Double averagePrice;

    @Column(name = "large_nut_min")
    private Double largeNutMin;

    @Column(name = "large_nut_max")
    private Double largeNutMax;

    @Column(name = "small_nut_min")
    private Double smallNutMin;

    @Column(name = "small_nut_max")
    private Double smallNutMax;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getWeekLabel() { return weekLabel; }
    public void setWeekLabel(String weekLabel) { this.weekLabel = weekLabel; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public Double getAveragePrice() { return averagePrice; }
    public void setAveragePrice(Double averagePrice) { this.averagePrice = averagePrice; }

    public Double getLargeNutMin() { return largeNutMin; }
    public void setLargeNutMin(Double largeNutMin) { this.largeNutMin = largeNutMin; }

    public Double getLargeNutMax() { return largeNutMax; }
    public void setLargeNutMax(Double largeNutMax) { this.largeNutMax = largeNutMax; }

    public Double getSmallNutMin() { return smallNutMin; }
    public void setSmallNutMin(Double smallNutMin) { this.smallNutMin = smallNutMin; }

    public Double getSmallNutMax() { return smallNutMax; }
    public void setSmallNutMax(Double smallNutMax) { this.smallNutMax = smallNutMax; }
}
