package com.coconutfarming.admin.controller;

import com.coconutfarming.user.repository.UserRepository;
import com.coconutfarming.plantation.repository.LandRepository;
import com.coconutfarming.community.repository.ArticleRepository;
import com.coconutfarming.plantation.repository.HarvestRecordRepository;
import com.coconutfarming.plantation.model.Land;
import com.coconutfarming.plantation.model.HarvestRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminReportController {

    private final UserRepository userRepository;
    private final LandRepository landRepository;
    private final ArticleRepository articleRepository;
    private final HarvestRecordRepository harvestRecordRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        // User Stats
        stats.put("totalUsers", userRepository.count());
        stats.put("totalFarmers", userRepository.countByRolesName("FARMER"));
        stats.put("totalOfficers", userRepository.countByRolesName("OFFICER"));
        stats.put("pendingUsers", userRepository.countByRolesNameAndStatus("OFFICER", "PENDING"));

        // Land Stats
        List<Land> allLands = landRepository.findAll();
        stats.put("totalLands", allLands.size());
        
        Map<String, Long> landsByDistrict = allLands.stream()
                .collect(Collectors.groupingBy(Land::getDistrict, Collectors.counting()));
        stats.put("landsByDistrict", landsByDistrict);

        Map<String, Long> landsByStatus = allLands.stream()
                .collect(Collectors.groupingBy(l -> l.getStatus() != null ? l.getStatus().toString() : "UNKNOWN", Collectors.counting()));
        stats.put("landsByStatus", landsByStatus);

        // Community Stats
        stats.put("totalArticles", articleRepository.count());
        
        // Harvest Stats
        List<HarvestRecord> allHarvests = harvestRecordRepository.findAll();
        int totalHarvested = allHarvests.stream().mapToInt(HarvestRecord::getTotalCoconuts).sum();
        stats.put("totalCoconutsHarvested", totalHarvested);
        
        // Group harvest by month (for charts)
        Map<String, Integer> harvestByDate = new TreeMap<>();
        allHarvests.forEach(h -> {
            String month = h.getHarvestDate().getMonth().toString() + " " + h.getHarvestDate().getYear();
            harvestByDate.put(month, harvestByDate.getOrDefault(month, 0) + h.getTotalCoconuts());
        });
        stats.put("harvestTrends", harvestByDate);

        return ResponseEntity.ok(stats);
    }
}
