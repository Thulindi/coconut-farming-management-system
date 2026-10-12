package com.coconutfarming.inventory.controller;

import com.coconutfarming.inventory.model.UsageTracking;
import com.coconutfarming.inventory.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usage")
@CrossOrigin(origins = "*")
public class usageController {

    @Autowired
    private InventoryService service;

    @GetMapping
    public ResponseEntity<List<UsageTracking>> getAll(
            @RequestParam Long userId,
            @RequestParam(required = false) String farmSection) {
        if (farmSection != null && !farmSection.isEmpty()) {
            return ResponseEntity.ok(service.getUsageByFarmSection(userId, farmSection));
        }
        return ResponseEntity.ok(service.getAllUsage(userId));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<UsageTracking>> getByItem(@RequestParam Long userId, @PathVariable Integer itemId) {
        return ResponseEntity.ok(service.getUsageByItem(userId, itemId));
    }

    @PostMapping
    public ResponseEntity<?> recordUsage(@RequestParam Long userId, @RequestBody Map<String, Object> body) {
        try {
            Integer itemId      = Integer.valueOf(body.get("itemId").toString());
            BigDecimal qtyUsed  = new BigDecimal(body.get("quantityUsed").toString());
            String farmSection  = body.get("farmSection") != null ? body.get("farmSection").toString() : "";
            String usedBy       = body.get("usedBy") != null ? body.get("usedBy").toString() : "";
            LocalDate date      = body.get("usageDate") != null
                    ? LocalDate.parse(body.get("usageDate").toString()) : LocalDate.now();
            String purpose      = body.get("purpose") != null ? body.get("purpose").toString() : "";

            UsageTracking result = service.recordUsage(userId, itemId, qtyUsed, farmSection, usedBy, date, purpose);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
