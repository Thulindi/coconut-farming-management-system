package com.coconutfarming.weather.controller;

import com.coconutfarming.weather.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWeather(@RequestParam(defaultValue = "Colombo") String city) {
        return ResponseEntity.ok(weatherService.getWeather(city));
    }

    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> getForecast(@RequestParam(defaultValue = "Colombo") String city) {
        return ResponseEntity.ok(weatherService.getForecast(city));
    }

    @GetMapping("/coconut-advice")
    public ResponseEntity<Map<String, Object>> getFarmingAdvice(@RequestParam(defaultValue = "Colombo") String city) {
        return ResponseEntity.ok(weatherService.getCoconutFarmingAdvice(city));
    }

}
