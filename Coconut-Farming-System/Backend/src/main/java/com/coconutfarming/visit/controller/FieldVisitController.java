package com.coconutfarming.visit.controller;

import com.coconutfarming.visit.dto.FieldVisitDto;
import com.coconutfarming.visit.dto.FieldVisitRequestDto;
import com.coconutfarming.visit.dto.FieldVisitActionDto;
import com.coconutfarming.visit.dto.FieldVisitCompleteDto;
import com.coconutfarming.visit.service.FieldVisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FieldVisitController {

    @Autowired
    private FieldVisitService fieldVisitService;

    @PostMapping("/request")
    public ResponseEntity<FieldVisitDto> createRequest(
            @RequestParam Long farmerId,
            @RequestBody FieldVisitRequestDto requestDto) {
        return ResponseEntity.ok(fieldVisitService.createFieldVisit(farmerId, requestDto));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<FieldVisitDto>> getFarmerRequests(@PathVariable Long farmerId) {
        return ResponseEntity.ok(fieldVisitService.getVisitsByFarmer(farmerId));
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<List<FieldVisitDto>> getPendingVisitsByDistrict(@PathVariable String district) {
        return ResponseEntity.ok(fieldVisitService.getPendingVisitsByDistrict(district));
    }

    @GetMapping("/officer/{officerId}")
    public ResponseEntity<List<FieldVisitDto>> getVisitsByOfficer(@PathVariable Long officerId) {
        return ResponseEntity.ok(fieldVisitService.getVisitsByOfficer(officerId));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<FieldVisitDto> acceptVisit(
            @PathVariable Long id,
            @RequestParam Long officerId,
            @RequestBody FieldVisitActionDto actionDto) {
        return ResponseEntity.ok(fieldVisitService.acceptVisit(id, officerId, actionDto));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<FieldVisitDto> completeVisit(
            @PathVariable Long id,
            @RequestParam Long officerId,
            @RequestBody FieldVisitCompleteDto completeDto) {
        return ResponseEntity.ok(fieldVisitService.completeVisit(id, officerId, completeDto));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<FieldVisitDto> rejectVisit(
            @PathVariable Long id,
            @RequestParam Long officerId,
            @RequestBody FieldVisitActionDto actionDto) {
        return ResponseEntity.ok(fieldVisitService.rejectVisit(id, officerId, actionDto));
    }

    @DeleteMapping("/{id}/officer-hide")
    public ResponseEntity<Void> hideVisitByOfficer(
            @PathVariable Long id,
            @RequestParam Long officerId) {
        fieldVisitService.deleteByOfficer(id, officerId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/farmer-hide")
    public ResponseEntity<Void> hideVisitByFarmer(
            @PathVariable Long id,
            @RequestParam Long farmerId) {
        fieldVisitService.deleteByFarmer(id, farmerId);
        return ResponseEntity.noContent().build();
    }
}
