package com.coconutfarming.weather.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class WeatherService {

    @Value("${weather.api.key}")
    private String apiKey;

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getWeather(String city) {
        try {
            String encodedCity = java.net.URLEncoder.encode(city, java.nio.charset.StandardCharsets.UTF_8);
            String url = "https://api.openweathermap.org/data/2.5/weather?q=" + encodedCity + "&appid=" + apiKey + "&units=metric";
            log.info("Fetching current weather for: {} (Encoded: {})", city, encodedCity);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            log.debug("Current weather response received for {}", city);
            return response;
        } catch (Exception e) {
            log.error("Error fetching current weather for {}: {}", city, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Could not fetch current weather data.");
            return error;
        }
    }

    public Map<String, Object> getForecast(String city) {
        try {
            String encodedCity = java.net.URLEncoder.encode(city, java.nio.charset.StandardCharsets.UTF_8);
            String url = "https://api.openweathermap.org/data/2.5/forecast?q=" + encodedCity + "&appid=" + apiKey + "&units=metric";
            log.info("Fetching forecast for: {} (Encoded: {})", city, encodedCity);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            log.debug("Forecast response received for {}", city);
            return response;
        } catch (Exception e) {
            log.error("Error fetching forecast for {}: {}", city, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Could not fetch forecast data.");
            return error;
        }
    }

    public Map<String, Object> getCoconutFarmingAdvice(String city) {
        log.info("Generating coconut farming advice for city: {}", city);
        Map<String, Object> weatherData = getWeather(city);
        Map<String, Object> forecastData = getForecast(city);
        Map<String, Object> response = new HashMap<>();

        if (weatherData.containsKey("error")) {
            log.error("Weather data error for {}: {}", city, weatherData.get("error"));
            return weatherData;
        }

        Map<String, Object> main = (Map<String, Object>) weatherData.get("main");
        Map<String, Object> wind = (Map<String, Object>) weatherData.get("wind");
        double temp = Double.parseDouble(main.get("temp").toString());
        double humidity = Double.parseDouble(main.get("humidity").toString());
        double windSpeed = wind.containsKey("speed") ? Double.parseDouble(wind.get("speed").toString()) : 0.0;
        String cityName = weatherData.get("name").toString();

        response.put("city", cityName);
        response.put("temperature", temp);
        response.put("humidity", humidity);
        response.put("windSpeed", windSpeed);

        StringBuilder advice = new StringBuilder(String.format("Currently %.1f°C with %d%% humidity in %s. ", temp, (int)humidity, cityName));
        String alert = "STABLE CONDITIONS";

        // Temperature Logic
        if (temp > 35) {
            advice.append("High temperature warning! Increase irrigation frequency to prevent heat stress and nut drooping.");
            alert = "HEAT ALERT: High Temperature";
        } else if (temp < 20) {
            advice.append("Lower temperatures detected; this may slightly slow down flower/fruit development.");
        } else {
            advice.append("Conditions are generally optimal for coconut tree growth.");
        }

        // Humidity Logic
        if (humidity < 60) {
            advice.append(" Low humidity. Mulching around palm bases is highly recommended to retain soil moisture.");
        } else if (humidity > 85) {
            advice.append(" High humidity detected. Monitor for Bud Rot and other fungal infections.");
        }

        // Wind Logic
        if (windSpeed > 10) {
            advice.append(" Strong winds detected. Strengthen supports for young palms.");
            alert = "WIND ALERT: High Speed";
        }

        // Simple Forecast Analytics
        if (!forecastData.containsKey("error")) {
            java.util.List<Map<String, Object>> list = (java.util.List<Map<String, Object>>) forecastData.get("list");
            log.info("Analyzing forecast list (size: {}) for {}", list.size(), city);
            boolean rainComing = false;
            for (int i = 0; i < Math.min(list.size(), 8); i++) { // Next 24 hours
                java.util.List<Map<String, Object>> weather = (java.util.List<Map<String, Object>>) list.get(i).get("weather");
                String mainWeather = weather.get(0).get("main").toString();
                if ("Rain".equalsIgnoreCase(mainWeather)) {
                    rainComing = true;
                    break;
                }
            }
            if (rainComing) {
                advice.append(" Rain expected soon! You can temporarily pause irrigation schedules to save water.");
                if (alert.contains("STABLE")) alert = "UPDATE: Rain Expected";
            }
        } else {
            log.warn("Forecast data was missing or had an error for {}", city);
        }

        response.put("farmingAdvice", advice.toString());
        response.put("alert", alert);
        response.put("forecast", forecastData.containsKey("error") ? null : forecastData);
        
        log.info("Completed advice generation for {}", city);
        return response;
    }

}
