package com.coconutfarming.financial.controller;

import com.coconutfarming.financial.dto.MarketPriceDTO;
import com.coconutfarming.financial.entity.CoconutPriceHistory;
import com.coconutfarming.financial.service.MarketPriceService;
import com.coconutfarming.financial.service.MarketTrendsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial/market-price")
@CrossOrigin(origins = "*")
public class MarketPriceController {

    @Autowired
    private MarketPriceService marketPriceService;

    @Autowired
    private MarketTrendsService marketTrendsService;

    @GetMapping
    public ResponseEntity<MarketPriceDTO> getMarketPrice() {
        return ResponseEntity.ok(marketPriceService.getLatestPrice());
    }

    @GetMapping("/history")
    public ResponseEntity<List<CoconutPriceHistory>> getPriceHistory() {
        return ResponseEntity.ok(marketTrendsService.getHistory());
    }
}

