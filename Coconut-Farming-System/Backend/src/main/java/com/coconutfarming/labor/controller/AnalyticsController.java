package com.coconutfarming.labor.controller;

import com.coconutfarming.labor.model.Task;
import com.coconutfarming.labor.service.WorkerService;
import com.coconutfarming.labor.service.TaskService;
import com.coconutfarming.labor.service.WorkLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {
    
    private final WorkerService workerService;
    private final TaskService taskService;
    private final WorkLogService workLogService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalWorkers", workerService.getAllWorkers(userId).size());
        stats.put("activeWorkers", workerService.getWorkerCountByStatus(userId, com.coconutfarming.labor.model.Worker.WorkerStatus.ACTIVE));
        stats.put("totalTasks", taskService.getAllTasks(userId).size());
        stats.put("pendingTasks", taskService.getTaskCountByStatus(userId, Task.TaskStatus.PENDING));
        stats.put("inProgressTasks", taskService.getTaskCountByStatus(userId, Task.TaskStatus.IN_PROGRESS));
        stats.put("completedTasks", taskService.getTaskCountByStatus(userId, Task.TaskStatus.COMPLETED));
        stats.put("overdueTasks", taskService.getOverdueTasks(userId).size());
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/worker-productivity/{workerId}")
    public ResponseEntity<Map<String, Object>> getWorkerProductivity(
            @RequestParam Long userId,
            @PathVariable Long workerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> productivity = new HashMap<>();
        
        Double totalHours = workLogService.getTotalHoursByWorkerAndPeriod(userId, workerId, startDate, endDate);
        var assignedTasks = taskService.getTasksByWorkerId(userId, workerId);
        var completedTasks = assignedTasks.stream()
                .filter(task -> task.getStatus() == Task.TaskStatus.COMPLETED)
                .count();
        
        productivity.put("workerId", workerId);
        productivity.put("totalHoursWorked", totalHours != null ? totalHours : 0.0);
        productivity.put("totalAssignedTasks", assignedTasks.size());
        productivity.put("completedTasks", completedTasks);
        productivity.put("completionRate", assignedTasks.size() > 0 ? (completedTasks * 100.0 / assignedTasks.size()) : 0.0);
        productivity.put("period", startDate + " to " + endDate);
        
        return ResponseEntity.ok(productivity);
    }
    
    @GetMapping("/task-completion-rate")
    public ResponseEntity<Map<String, Object>> getTaskCompletionRate(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> completionRate = new HashMap<>();
        
        var allTasks = taskService.getAllTasks(userId);
        var completedTasks = allTasks.stream()
                .filter(task -> task.getStatus() == Task.TaskStatus.COMPLETED)
                .count();
        
        completionRate.put("totalTasks", allTasks.size());
        completionRate.put("completedTasks", completedTasks);
        completionRate.put("completionRate", allTasks.size() > 0 ? (completedTasks * 100.0 / allTasks.size()) : 0.0);
        completionRate.put("period", startDate + " to " + endDate);
        
        return ResponseEntity.ok(completionRate);
    }
    
    @GetMapping("/labor-cost-analysis")
    public ResponseEntity<Map<String, Object>> getLaborCostAnalysis(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> costAnalysis = new HashMap<>();
        
        var workers = workerService.getAllWorkers(userId);
        double totalLaborCost = 0.0;
        
        for (var worker : workers) {
            if (worker.getStatus() == com.coconutfarming.labor.model.Worker.WorkerStatus.ACTIVE && worker.getHourlyRate() != null) {
                Double hours = workLogService.getTotalHoursByWorkerAndPeriod(userId, worker.getId(), startDate, endDate);
                if (hours != null) {
                    totalLaborCost += hours * worker.getHourlyRate();
                }
            }
        }
        
        costAnalysis.put("totalLaborCost", totalLaborCost);
        costAnalysis.put("period", startDate + " to " + endDate);
        costAnalysis.put("activeWorkers", workers.stream()
                .filter(w -> w.getStatus() == com.coconutfarming.labor.model.Worker.WorkerStatus.ACTIVE)
                .count());
        
        return ResponseEntity.ok(costAnalysis);
    }
    
    @GetMapping("/work-distribution")
    public ResponseEntity<Map<String, Object>> getWorkDistribution(@RequestParam Long userId) {
        Map<String, Object> distribution = new HashMap<>();
        
        var tasksByPriority = Map.of(
                "LOW", taskService.getTasksByPriority(userId, Task.TaskPriority.LOW).size(),
                "MEDIUM", taskService.getTasksByPriority(userId, Task.TaskPriority.MEDIUM).size(),
                "HIGH", taskService.getTasksByPriority(userId, Task.TaskPriority.HIGH).size(),
                "URGENT", taskService.getTasksByPriority(userId, Task.TaskPriority.URGENT).size()
        );
        
        var tasksByStatus = Map.of(
                "PENDING", taskService.getTaskCountByStatus(userId, Task.TaskStatus.PENDING),
                "IN_PROGRESS", taskService.getTaskCountByStatus(userId, Task.TaskStatus.IN_PROGRESS),
                "COMPLETED", taskService.getTaskCountByStatus(userId, Task.TaskStatus.COMPLETED),
                "CANCELLED", taskService.getTaskCountByStatus(userId, Task.TaskStatus.CANCELLED),
                "ON_HOLD", taskService.getTaskCountByStatus(userId, Task.TaskStatus.ON_HOLD)
        );
        
        distribution.put("tasksByPriority", tasksByPriority);
        distribution.put("tasksByStatus", tasksByStatus);
        
        return ResponseEntity.ok(distribution);
    }
}
