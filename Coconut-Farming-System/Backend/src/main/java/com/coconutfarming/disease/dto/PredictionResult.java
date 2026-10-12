package com.coconutfarming.disease.dto;

public class PredictionResult {
    private String disease;
    private Double confidence;
    private String error;

    // Getters and Setters
    public String getDisease() { return disease; }
    public void setDisease(String disease) { this.disease = disease; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
