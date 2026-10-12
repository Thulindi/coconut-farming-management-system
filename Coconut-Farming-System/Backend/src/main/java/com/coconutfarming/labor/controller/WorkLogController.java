package com.coconutfarming.labor.controller;

import com.coconutfarming.labor.dto.WorkLogDto;
import com.coconutfarming.labor.service.WorkLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/work-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkLogController {
    
    private final WorkLogService workLogService;
    
    @PostMapping
    public ResponseEntity<WorkLogDto> createWorkLog(@RequestParam Long userId, @Valid @RequestBody WorkLogDto workLogDto) {
        WorkLogDto createdWorkLog = workLogService.createWorkLog(userId, workLogDto);
        return new ResponseEntity<>(createdWorkLog, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<WorkLogDto> getWorkLogById(@RequestParam Long userId, @PathVariable Long id) {
        WorkLogDto workLog = workLogService.getWorkLogById(id);
        return ResponseEntity.ok(workLog);
    }
    
    @GetMapping
    public ResponseEntity<List<WorkLogDto>> getAllWorkLogs(@RequestParam Long userId) {
        List<WorkLogDto> workLogs = workLogService.getAllWorkLogs(userId);
        return ResponseEntity.ok(workLogs);
    }
    
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<WorkLogDto>> getWorkLogsByWorkerId(@RequestParam Long userId, @PathVariable Long workerId) {
        List<WorkLogDto> workLogs = workLogService.getWorkLogsByWorkerId(userId, workerId);
        return ResponseEntity.ok(workLogs);
    }
    
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<WorkLogDto>> getWorkLogsByTaskId(@RequestParam Long userId, @PathVariable Long taskId) {
        List<WorkLogDto> workLogs = workLogService.getWorkLogsByTaskId(userId, taskId);
        return ResponseEntity.ok(workLogs);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<WorkLogDto>> getWorkLogsByDateRange(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<WorkLogDto> workLogs = workLogService.getWorkLogsByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(workLogs);
    }
    
    @GetMapping("/worker/{workerId}/date-range")
    public ResponseEntity<List<WorkLogDto>> getWorkLogsByWorkerAndDateRange(
            @RequestParam Long userId,
            @PathVariable Long workerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<WorkLogDto> workLogs = workLogService.getWorkLogsByWorkerAndDateRange(userId, workerId, startDate, endDate);
        return ResponseEntity.ok(workLogs);
    }
    
    @GetMapping("/date/{date}")
    public ResponseEntity<List<WorkLogDto>> getWorkLogsByDate(
            @RequestParam Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<WorkLogDto> workLogs = workLogService.getWorkLogsByDate(userId, date);
        return ResponseEntity.ok(workLogs);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<WorkLogDto> updateWorkLog(@RequestParam Long userId, @PathVariable Long id, @Valid @RequestBody WorkLogDto workLogDto) {
        WorkLogDto updatedWorkLog = workLogService.updateWorkLog(userId, id, workLogDto);
        return ResponseEntity.ok(updatedWorkLog);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkLog(@RequestParam Long userId, @PathVariable Long id) {
        workLogService.deleteWorkLog(userId, id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/worker/{workerId}/total-hours")
    public ResponseEntity<Double> getTotalHoursByWorkerAndPeriod(
            @RequestParam Long userId,
            @PathVariable Long workerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Double totalHours = workLogService.getTotalHoursByWorkerAndPeriod(userId, workerId, startDate, endDate);
        return ResponseEntity.ok(totalHours);
    }
    
    @GetMapping("/task/{taskId}/total-hours")
    public ResponseEntity<Double> getTotalHoursByTask(@RequestParam Long userId, @PathVariable Long taskId) {
        Double totalHours = workLogService.getTotalHoursByTask(userId, taskId);
        return ResponseEntity.ok(totalHours);
    }
}
