package com.coconutfarming.disease.controller;

import com.coconutfarming.disease.model.DiseaseDetectionHistory;
import com.coconutfarming.disease.service.DiseaseDetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/disease")
@CrossOrigin(origins = "*") // Allows React frontend to call this API
public class DiseaseDetectionController {

    @Autowired
    private DiseaseDetectionService service;

    @PostMapping("/detect")
    public ResponseEntity<?> detectDisease(
            @RequestParam("userId") Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            DiseaseDetectionHistory history = service.detectAndSave(userId, file);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<DiseaseDetectionHistory>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getUserHistory(userId));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteHistory(@PathVariable Long id, @RequestParam("userId") Long userId) {
        try {
            service.deleteHistory(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
