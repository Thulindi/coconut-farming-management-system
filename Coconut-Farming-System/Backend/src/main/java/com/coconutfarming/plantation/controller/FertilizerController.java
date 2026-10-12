package com.coconutfarming.plantation.controller;

import com.coconutfarming.plantation.dto.FertilizerApplicationRequest;
import com.coconutfarming.plantation.dto.FertilizerApplicationResponse;
import com.coconutfarming.plantation.dto.FertilizerScheduleRequest;
import com.coconutfarming.plantation.dto.FertilizerScheduleResponse;
import com.coconutfarming.plantation.dto.FertilizingTimelineResponse;
import com.coconutfarming.plantation.service.FertilizerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FertilizerController {
    private final FertilizerService fertilizerService;

    public FertilizerController(FertilizerService fertilizerService) {
        this.fertilizerService = fertilizerService;
    }

    @GetMapping("/schedules/count")
    public Long getActiveCount(@RequestParam Long farmerId) {
        return fertilizerService.countActiveSchedules(farmerId);
    }

    @GetMapping("/lands/{landId}/schedules")
    public List<FertilizerScheduleResponse> listSchedules(@RequestParam Long farmerId, @PathVariable Long landId) {
        return fertilizerService.getSchedules(farmerId, landId);
    }

    @PostMapping("/lands/{landId}/schedules")
    public ResponseEntity<FertilizerScheduleResponse> createSchedule(@RequestParam Long farmerId,
                                                                      @PathVariable Long landId,
                                                                      @Valid @RequestBody FertilizerScheduleRequest request) {
        return new ResponseEntity<>(fertilizerService.createSchedule(farmerId, landId, request), HttpStatus.CREATED);
    }

    @PutMapping("/schedules/{scheduleId}")
    public FertilizerScheduleResponse updateSchedule(@RequestParam Long farmerId,
                                                     @PathVariable Long scheduleId,
                                                     @Valid @RequestBody FertilizerScheduleRequest request) {
        return fertilizerService.updateSchedule(farmerId, scheduleId, request);
    }

    @DeleteMapping("/schedules/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(@RequestParam Long farmerId, @PathVariable Long scheduleId) {
        fertilizerService.deleteSchedule(farmerId, scheduleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/schedules/{scheduleId}/applications")
    public List<FertilizerApplicationResponse> listApplications(@RequestParam Long farmerId, @PathVariable Long scheduleId) {
        return fertilizerService.getApplications(farmerId, scheduleId);
    }

    @PostMapping("/schedules/{scheduleId}/applications")
    public ResponseEntity<FertilizerApplicationResponse> logApplication(@RequestParam Long farmerId,
                                                                         @PathVariable Long scheduleId,
                                                                         @Valid @RequestBody FertilizerApplicationRequest request) {
        return new ResponseEntity<>(fertilizerService.logApplication(farmerId, scheduleId, request), HttpStatus.CREATED);
    }

    @GetMapping("/lands/{landId}/fertilizing/timeline")
    public FertilizingTimelineResponse timeline(@RequestParam Long farmerId, @PathVariable Long landId) {
        return fertilizerService.getTimeline(farmerId, landId);
    }
}
