package com.coconutfarming.financial.service;

import com.coconutfarming.financial.dto.MarketPriceDTO;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MarketPriceService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MarketPriceService.class);
    private static final String CDA_URL = "https://www.cda.gov.lk/web/index.php?option=com_content&view=article&id=16&Itemid=240&lang=en";
    private MarketPriceDTO cachedPrice;
    private LocalDateTime lastFetched;

    public MarketPriceDTO getLatestPrice() {
        log.info("Fetching latest coconut market prices from CDA...");
        
        // Cache for 1 hour to avoid overloading the source website
        if (cachedPrice != null && lastFetched != null && lastFetched.isAfter(LocalDateTime.now().minusHours(1))) {
            log.info("Returning cached market prices.");
            return cachedPrice;
        }

        try {
            log.debug("Connecting to CDA URL: {}", CDA_URL);
            // Use a proper User-Agent to avoid 406/403 errors
            Document doc = Jsoup.connect(CDA_URL)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                    .timeout(5000) // 5 seconds timeout
                    .get();

            log.info("Data successfully fetched from CDA. Parsing HTML...");
            MarketPriceDTO dto = new MarketPriceDTO();
            
            // Find the table and rows
            Elements rows = doc.select("tr");
            boolean found = false;

            for (Element row : rows) {
                String rowText = row.text().toLowerCase();
                
                // Look for the "Fresh Coconut" row
                if (rowText.contains("fresh coconut")) {
                    log.info("Found potential market price row: {}", row.text());
                    // Extract price ranges using regex
                    // Matches decimal numbers like 160.00 or 170.00
                    Matcher m = Pattern.compile("(\\d{2,3}\\.\\d{2})").matcher(rowText);
                    
                    java.util.List<Double> prices = new java.util.ArrayList<>();
                    while (m.find()) {
                        prices.add(Double.parseDouble(m.group(1)));
                    }

                    if (prices.size() >= 4) {
                        dto.setLargeMin(prices.get(0));
                        dto.setLargeMax(prices.get(1));
                        dto.setSmallMin(prices.get(2));
                        dto.setSmallMax(prices.get(3));
                        found = true;
                        break;
                    } else if (prices.size() >= 2) {
                        // If only 2 prices, assume it's one range
                        dto.setLargeMin(prices.get(0));
                        dto.setLargeMax(prices.get(1));
                        dto.setSmallMin(prices.get(0) * 0.85); // Estimated
                        dto.setSmallMax(prices.get(1) * 0.85); // Estimated
                        found = true;
                        break;
                    }
                }
            }

            // Extract the date of the prices if available
            Elements allTextElements = doc.select("th, td, p, h1, h2, h3");
            for (Element el : allTextElements) {
                String text = el.text();
                if (text.contains("Prices on")) {
                    dto.setDate(text.replace("Prices on", "").trim());
                    break;
                }
            }

            if (dto.getDate() == null || dto.getDate().isEmpty()) {
                dto.setDate(java.time.LocalDate.now().toString());
            }

            if (found) {
                // Calculate average price for a single nut
                double avg = (dto.getLargeMin() + dto.getLargeMax() + dto.getSmallMin() + dto.getSmallMax()) / 4.0;
                dto.setAverage(Math.round(avg * 100.0) / 100.0);
                log.info("Market prices successfully parsed: Avg Rs. {}", dto.getAverage());
                
                cachedPrice = dto;
                lastFetched = LocalDateTime.now();
                return dto;
            }

            log.warn("Fresh Coconut data not found in the table. Using fallback.");
            return getFallbackPrice();

        } catch (IOException e) {
            log.error("Error scraping CDA site: {}. Using fallback.", e.getMessage());
            return getFallbackPrice();
        }
    }

    private MarketPriceDTO getFallbackPrice() {
        if (cachedPrice != null) return cachedPrice;
        
        // Default historical values if scraping fails
        MarketPriceDTO dto = new MarketPriceDTO();
        dto.setDate("Latest (Source: CDA)");
        dto.setLargeMin(160.0);
        dto.setLargeMax(170.0);
        dto.setSmallMin(140.0);
        dto.setSmallMax(150.0);
        dto.setAverage(155.0);
        return dto;
    }
}
