package com.coconutfarming.admin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController("adminDashboardController")
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        try {
            // Count from User module
            Integer users = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            summary.put("totalUsers", users != null ? users : 0);

            // Count from Plantation module (Lands)
            Integer lands = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM lands", Integer.class);
            summary.put("totalLands", lands != null ? lands : 0);

            // Count from Labor module (Workers)
            Integer workers = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM workers", Integer.class);
            summary.put("totalWorkers", workers != null ? workers : 0);

            // Count from Inventory module (Items)
            Integer inventoryItems = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM inventory_items", Integer.class);
            summary.put("totalInventoryItems", inventoryItems != null ? inventoryItems : 0);

            // Fetch Total Profit from Financial module
            Double totalIncome = jdbcTemplate.queryForObject(
                    "SELECT SUM(amount) FROM financial_records WHERE record_type = 'INCOME'", Double.class);
            Double totalExpense = jdbcTemplate.queryForObject(
                    "SELECT SUM(amount) FROM financial_records WHERE record_type = 'EXPENSE'", Double.class);
            
            double profit = (totalIncome != null ? totalIncome : 0) - (totalExpense != null ? totalExpense : 0);
            summary.put("totalProfit", profit);

            // Count from Community module (Articles)  - assuming user table collision is handled
            // since both use "users" normally, we just query articles
            Integer articles = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM articles", Integer.class);
            summary.put("totalCommunityPosts", articles != null ? articles : 0);

        } catch (Exception e) {
            summary.put("error", "Some tables are not initialized yet. Please start inserting data.");
        }

        return ResponseEntity.ok(summary);
    }
}
