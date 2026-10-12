package com.coconutfarming.community.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NewsService {

    @Value("${news.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getAgricultureNews() {
        String url = "https://gnews.io/api/v4/search?q=agriculture&lang=en&apikey=" + apiKey;
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Could not fetch agriculture news. Please check your GNews API key.");
            return error;
        }
    }
}
