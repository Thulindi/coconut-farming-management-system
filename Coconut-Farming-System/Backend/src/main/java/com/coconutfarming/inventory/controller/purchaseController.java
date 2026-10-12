package com.coconutfarming.inventory.controller;

import com.coconutfarming.inventory.model.PurchaseHistory;
import com.coconutfarming.inventory.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "*")
public class purchaseController {

    @Autowired
    private InventoryService service;

    @GetMapping
    public ResponseEntity<List<PurchaseHistory>> getAll(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getPurchaseHistory(userId));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<PurchaseHistory>> getByItem(@RequestParam Long userId, @PathVariable Integer itemId) {
        return ResponseEntity.ok(service.getPurchaseHistoryByItem(userId, itemId));
    }

    @PostMapping
    public ResponseEntity<?> recordPurchase(@RequestParam Long userId, @RequestBody Map<String, Object> body) {
        try {
            Integer itemId     = Integer.valueOf(body.get("itemId").toString());
            Integer supplierId = body.get("supplierId") != null
                    ? Integer.valueOf(body.get("supplierId").toString()) : null;
            BigDecimal qty     = new BigDecimal(body.get("quantity").toString());
            BigDecimal price   = new BigDecimal(body.get("unitPrice").toString());
            LocalDate date     = body.get("purchaseDate") != null
                    ? LocalDate.parse(body.get("purchaseDate").toString()) : LocalDate.now();
            String notes       = body.get("notes") != null ? body.get("notes").toString() : "";

            PurchaseHistory result = service.recordPurchase(userId, itemId, supplierId, qty, price, date, notes);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
