package com.coconutfarming.gps.controller;

import com.coconutfarming.gps.model.PlantationLocation;
import com.coconutfarming.gps.repository.PlantationLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gps")
@CrossOrigin(origins = "*")
public class GpsController {

    @Autowired
    private PlantationLocationRepository locationRepository;

    @GetMapping("/locations")
    public List<PlantationLocation> getAllLocations() {
        return locationRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/location")
    public ResponseEntity<PlantationLocation> saveLocation(@RequestBody PlantationLocation location) {
        return ResponseEntity.ok(locationRepository.save(location));
    }

    @DeleteMapping("/location/{id}")
    public ResponseEntity<Map<String, String>> deleteLocation(@PathVariable Long id) {
        locationRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Location deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/map-link/{id}")
    public ResponseEntity<Map<String, String>> getMapLink(@PathVariable Long id) {
        PlantationLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        
        String url = "https://www.google.com/maps?q=" + location.getLatitude() + "," + location.getLongitude();
        
        Map<String, String> response = new HashMap<>();
        response.put("googleMapsUrl", url);
        return ResponseEntity.ok(response);
    }
}
