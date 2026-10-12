package com.coconutfarming.financial.controller;

import com.coconutfarming.financial.entity.FinancialRecord;
import com.coconutfarming.financial.service.FinancialService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = "*")
public class FinancialController {

    private final FinancialService financialService;

    public FinancialController(FinancialService financialService) {
        this.financialService = financialService;
    }

    @GetMapping("/records")
    public List<FinancialRecord> getAllRecords(@RequestParam Long userId) {
        return financialService.getAllRecords(userId);
    }

    @GetMapping("/records/{id}")
    public ResponseEntity<FinancialRecord> getRecord(@RequestParam Long userId, @PathVariable Long id) {
        return ResponseEntity.ok(financialService.getRecordById(userId, id));
    }

    @PostMapping("/records")
    public FinancialRecord createRecord(@RequestParam Long userId, @Valid @RequestBody FinancialRecord record) {
        return financialService.createRecord(userId, record);
    }

    @PutMapping("/records/{id}")
    public FinancialRecord updateRecord(@RequestParam Long userId, @PathVariable Long id, @Valid @RequestBody FinancialRecord record) {
        return financialService.updateRecord(userId, id, record);
    }

    @DeleteMapping("/records/{id}")
    public ResponseEntity<Void> deleteRecord(@RequestParam Long userId, @PathVariable Long id) {
        financialService.deleteRecord(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardSummary(@RequestParam Long userId) {
        return financialService.getDashboardSummary(userId);
    }

    @GetMapping("/monthly-comparison")
    public List<Map<String, Object>> getMonthlyComparison(@RequestParam Long userId, @RequestParam(defaultValue = "6") int months) {
        return financialService.getMonthlyComparison(userId, months);
    }

    @GetMapping("/category-breakdown")
    public List<Map<String, Object>> getCategoryBreakdown(@RequestParam Long userId) {
        return financialService.getCategoryBreakdown(userId);
    }
}
