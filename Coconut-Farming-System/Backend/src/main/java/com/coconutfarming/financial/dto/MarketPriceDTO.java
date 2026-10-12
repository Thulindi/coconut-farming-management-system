package com.coconutfarming.financial.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketPriceDTO {
    private String date;
    private double largeMin;
    private double largeMax;
    private double smallMin;
    private double smallMax;
    private double average;
    private String source = "Coconut Development Authority (CDA)";
}
