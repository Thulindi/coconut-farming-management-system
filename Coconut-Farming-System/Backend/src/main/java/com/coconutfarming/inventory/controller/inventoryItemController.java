package com.coconutfarming.inventory.controller;

import com.coconutfarming.inventory.model.InventoryItem;
import com.coconutfarming.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class inventoryItemController {

    @Autowired
    private InventoryService service;

    @GetMapping
    public ResponseEntity<List<InventoryItem>> getAll(
            @RequestParam Long userId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(service.searchItems(userId, search));
        }
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(service.getItemsByCategory(userId, category));
        }
        return ResponseEntity.ok(service.getAllItems(userId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryItem>> getLowStock(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getLowStockItems(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return service.getItemById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Item not found")));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestParam Long userId, @Valid @RequestBody InventoryItem item) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.saveItem(userId, item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody InventoryItem item) {
        try {
            return ResponseEntity.ok(service.updateItem(id, item));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            service.deleteItem(id);
            return ResponseEntity.ok(Map.of("message", "Item removed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
