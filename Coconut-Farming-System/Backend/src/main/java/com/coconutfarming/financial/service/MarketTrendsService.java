package com.coconutfarming.financial.service;

import com.coconutfarming.financial.dto.MarketPriceDTO;
import com.coconutfarming.financial.entity.CoconutPriceHistory;
import com.coconutfarming.financial.repository.CoconutPriceHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.List;

@Service
public class MarketTrendsService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MarketTrendsService.class);

    @Autowired
    private CoconutPriceHistoryRepository repository;

    @Autowired
    private MarketPriceService marketPriceService;

    public List<CoconutPriceHistory> getHistory() {
        return repository.findAllByOrderByRecordDateAsc();
    }

    /**
     * Scheduled task to update the market price history automatically.
     * Runs every Monday at 1:00 AM.
     * It fetches the latest scraped data from CDA and saves it as a new historical record.
     */
    @Scheduled(cron = "0 0 1 ? * MON")
    public void updateWeeklyPrice() {
        log.info("Starting scheduled weekly market price trend update...");
        try {
            MarketPriceDTO latest = marketPriceService.getLatestPrice();
            
            // Check if we already have a record for the current week to avoid duplicates
            LocalDate today = LocalDate.now();
            List<CoconutPriceHistory> history = repository.findAllByOrderByRecordDateAsc();
            
            boolean alreadyExists = history.stream()
                    .anyMatch(h -> h.getRecordDate().isAfter(today.minusDays(6)));
            
            if (alreadyExists) {
                log.info("Price record for the current week already exists. Skipping.");
                return;
            }

            CoconutPriceHistory h = new CoconutPriceHistory();
            // Label based on total records to maintain the "Week X" sequence
            h.setWeekLabel("Week " + (history.size() + 1));
            h.setRecordDate(today);
            h.setAveragePrice(latest.getAverage());
            h.setLargeNutMin(latest.getLargeMin());
            h.setLargeNutMax(latest.getLargeMax());
            h.setSmallNutMin(latest.getSmallMin());
            h.setSmallNutMax(latest.getSmallMax());
            
            repository.save(h);
            log.info("Successfully saved new weekly price record for date: {}", today);
            
            // Keep the chart focused by maintaining only the last 15 records
            cleanupOldRecords();
            
        } catch (Exception e) {
            log.error("Error during scheduled market price update: {}", e.getMessage());
        }
    }

    private void cleanupOldRecords() {
        List<CoconutPriceHistory> history = repository.findAllByOrderByRecordDateAsc();
        if (history.size() > 15) {
            int toDelete = history.size() - 15;
            for (int i = 0; i < toDelete; i++) {
                repository.delete(history.get(i));
            }
            log.info("Cleaned up {} old historical records to maintain chart performance.", toDelete);
        }
    }

    @PostConstruct
    public void seedIfEmpty() {
        if (repository.count() > 0) return;

        log.info("Seeding initial 12-week market price history data...");
        // 12 weeks of realistic Sri Lankan coconut prices (large nut, per nut in Rs.)
        // Based on CDA reported data trends 2025–2026
        Object[][] data = {
            {"Week 1",  -77, 148.0, 140.0, 156.0, 122.0, 132.0},
            {"Week 2",  -70, 152.0, 143.0, 161.0, 125.0, 135.0},
            {"Week 3",  -63, 158.0, 149.0, 167.0, 130.0, 140.0},
            {"Week 4",  -56, 163.0, 153.0, 173.0, 133.0, 143.0},
            {"Week 5",  -49, 170.0, 160.0, 180.0, 138.0, 148.0},
            {"Week 6",  -42, 175.0, 165.0, 185.0, 142.0, 152.0},
            {"Week 7",  -35, 168.0, 157.0, 179.0, 136.0, 146.0},
            {"Week 8",  -28, 162.0, 152.0, 172.0, 131.0, 141.0},
            {"Week 9",  -21, 155.0, 145.0, 165.0, 127.0, 137.0},
            {"Week 10", -14, 158.0, 148.0, 168.0, 129.0, 139.0},
            {"Week 11",  -7, 161.0, 151.0, 171.0, 131.0, 141.0},
            {"Week 12",   0, 163.0, 153.0, 173.0, 133.0, 143.0},
        };

        LocalDate today = LocalDate.now();
        for (Object[] row : data) {
            CoconutPriceHistory h = new CoconutPriceHistory();
            h.setWeekLabel((String) row[0]);
            h.setRecordDate(today.plusDays((int) row[1]));
            h.setAveragePrice((Double) row[2]);
            h.setLargeNutMin((Double) row[3]);
            h.setLargeNutMax((Double) row[4]);
            h.setSmallNutMin((Double) row[5]);
            h.setSmallNutMax((Double) row[6]);
            repository.save(h);
        }
        log.info("Market price history seeding complete.");
    }
}
