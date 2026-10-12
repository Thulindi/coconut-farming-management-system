package com.coconutfarming.inventory.controller;

import com.coconutfarming.inventory.model.Supplier;
import com.coconutfarming.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class supplierController {

    @Autowired
    private InventoryService service;

    @GetMapping
    public ResponseEntity<List<Supplier>> getAll(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getAllSuppliers(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return service.getSupplierById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Supplier not found")));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestParam Long userId, @Valid @RequestBody Supplier supplier) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.saveSupplier(userId, supplier));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody Supplier supplier) {
        try {
            return ResponseEntity.ok(service.updateSupplier(id, supplier));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            service.deleteSupplier(id);
            return ResponseEntity.ok(Map.of("message", "Supplier removed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
