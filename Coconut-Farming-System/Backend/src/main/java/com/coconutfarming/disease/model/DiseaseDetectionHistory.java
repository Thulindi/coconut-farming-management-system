package com.coconutfarming.disease.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "disease_detection_history")
public class DiseaseDetectionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "disease_name", nullable = false)
    private String diseaseName;

    @Column(name = "confidence", nullable = false)
    private Double confidence;

    @Column(name = "treatment_recommendation", columnDefinition = "TEXT")
    private String treatmentRecommendation;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDiseaseName() {
        return diseaseName;
    }

    public void setDiseaseName(String diseaseName) {
        this.diseaseName = diseaseName;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getTreatmentRecommendation() {
        return treatmentRecommendation;
    }

    public void setTreatmentRecommendation(String treatmentRecommendation) {
        this.treatmentRecommendation = treatmentRecommendation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
