package com.coconutfarming.plantation.controller;

import com.coconutfarming.plantation.dto.HarvestAnalyticsResponse;
import com.coconutfarming.plantation.dto.HarvestRequest;
import com.coconutfarming.plantation.dto.HarvestResponse;
import com.coconutfarming.plantation.service.HarvestService;
import com.coconutfarming.plantation.util.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api")
public class HarvestController {
    private final HarvestService harvestService;

    public HarvestController(HarvestService harvestService) {
        this.harvestService = harvestService;
    }

    @GetMapping("/lands/{landId}/harvests")
    public Page<HarvestResponse> list(@RequestParam Long farmerId,
                                      @PathVariable Long landId,
                                      @RequestParam(required = false) LocalDate start,
                                      @RequestParam(required = false) LocalDate end,
                                      @RequestParam(required = false) String season,
                                      @PageableDefault(size = 20) Pageable pageable) {
        return harvestService.search(farmerId, landId, start, end, season, pageable)
            .map(MapperUtil::toHarvestResponse);
    }

    @PostMapping("/lands/{landId}/harvests")
    public ResponseEntity<HarvestResponse> create(@RequestParam Long farmerId,
                                                  @PathVariable Long landId,
                                                  @Valid @RequestBody HarvestRequest request) {
        return new ResponseEntity<>(MapperUtil.toHarvestResponse(harvestService.create(farmerId, landId, request)), HttpStatus.CREATED);
    }

    @PutMapping("/harvests/{harvestId}")
    public HarvestResponse update(@RequestParam Long farmerId,
                                  @PathVariable Long harvestId,
                                  @Valid @RequestBody HarvestRequest request) {
        return MapperUtil.toHarvestResponse(harvestService.update(farmerId, harvestId, request));
    }

    @DeleteMapping("/harvests/{harvestId}")
    public ResponseEntity<Void> delete(@RequestParam Long farmerId, @PathVariable Long harvestId) {
        harvestService.delete(farmerId, harvestId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/lands/{landId}/analytics/harvest")
    public HarvestAnalyticsResponse analytics(@RequestParam Long farmerId, @PathVariable Long landId) {
        return harvestService.analytics(farmerId, landId);
    }
}
