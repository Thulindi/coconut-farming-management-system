package com.coconutfarming.labor.controller;

import com.coconutfarming.labor.dto.WorkerDto;
import com.coconutfarming.labor.model.Worker;
import com.coconutfarming.labor.service.WorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkerController {
    
    private final WorkerService workerService;
    
    @PostMapping
    public ResponseEntity<WorkerDto> createWorker(@RequestParam Long userId, @Valid @RequestBody WorkerDto workerDto) {
        WorkerDto createdWorker = workerService.createWorker(userId, workerDto);
        return new ResponseEntity<>(createdWorker, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<WorkerDto> getWorkerById(@RequestParam Long userId, @PathVariable Long id) {
        WorkerDto worker = workerService.getWorkerById(id);
        return ResponseEntity.ok(worker);
    }
    
    @GetMapping
    public ResponseEntity<List<WorkerDto>> getAllWorkers(@RequestParam Long userId) {
        List<WorkerDto> workers = workerService.getAllWorkers(userId);
        return ResponseEntity.ok(workers);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<WorkerDto>> getWorkersByStatus(@RequestParam Long userId, @PathVariable Worker.WorkerStatus status) {
        List<WorkerDto> workers = workerService.getWorkersByStatus(userId, status);
        return ResponseEntity.ok(workers);
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<WorkerDto>> getAvailableWorkers(@RequestParam Long userId) {
        List<WorkerDto> workers = workerService.getAvailableWorkers(userId);
        return ResponseEntity.ok(workers);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<WorkerDto>> searchWorkersBySkill(@RequestParam Long userId, @RequestParam String skill) {
        List<WorkerDto> workers = workerService.searchWorkersBySkill(userId, skill);
        return ResponseEntity.ok(workers);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<WorkerDto> updateWorker(@RequestParam Long userId, @PathVariable Long id, @Valid @RequestBody WorkerDto workerDto) {
        WorkerDto updatedWorker = workerService.updateWorker(userId, id, workerDto);
        return ResponseEntity.ok(updatedWorker);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<WorkerDto> changeWorkerStatus(@RequestParam Long userId, @PathVariable Long id, @RequestParam Worker.WorkerStatus status) {
        WorkerDto updatedWorker = workerService.changeWorkerStatus(id, status);
        return ResponseEntity.ok(updatedWorker);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorker(@RequestParam Long userId, @PathVariable Long id) {
        workerService.deleteWorker(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/count/{status}")
    public ResponseEntity<Long> getWorkerCountByStatus(@RequestParam Long userId, @PathVariable Worker.WorkerStatus status) {
        long count = workerService.getWorkerCountByStatus(userId, status);
        return ResponseEntity.ok(count);
    }
}
