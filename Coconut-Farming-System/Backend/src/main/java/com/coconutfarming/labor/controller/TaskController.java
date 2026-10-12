package com.coconutfarming.labor.controller;

import com.coconutfarming.labor.dto.TaskDto;
import com.coconutfarming.labor.model.Task;
import com.coconutfarming.labor.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {
    
    private final TaskService taskService;
    
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@RequestParam Long userId, @Valid @RequestBody TaskDto taskDto) {
        TaskDto createdTask = taskService.createTask(userId, taskDto);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@RequestParam Long userId, @PathVariable Long id) {
        TaskDto task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }
    
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks(@RequestParam Long userId) {
        List<TaskDto> tasks = taskService.getAllTasks(userId);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<TaskDto>> getTasksByWorkerId(@RequestParam Long userId, @PathVariable Long workerId) {
        List<TaskDto> tasks = taskService.getTasksByWorkerId(userId, workerId);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskDto>> getTasksByStatus(@RequestParam Long userId, @PathVariable Task.TaskStatus status) {
        List<TaskDto> tasks = taskService.getTasksByStatus(userId, status);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TaskDto>> getTasksByPriority(@RequestParam Long userId, @PathVariable Task.TaskPriority priority) {
        List<TaskDto> tasks = taskService.getTasksByPriority(userId, priority);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/overdue")
    public ResponseEntity<List<TaskDto>> getOverdueTasks(@RequestParam Long userId) {
        List<TaskDto> tasks = taskService.getOverdueTasks(userId);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/active-ordered")
    public ResponseEntity<List<TaskDto>> getActiveTasksOrderedByPriority(@RequestParam Long userId) {
        List<TaskDto> tasks = taskService.getActiveTasksOrderedByPriority(userId);
        return ResponseEntity.ok(tasks);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@RequestParam Long userId, @PathVariable Long id, @Valid @RequestBody TaskDto taskDto) {
        TaskDto updatedTask = taskService.updateTask(id, taskDto);
        return ResponseEntity.ok(updatedTask);
    }
    
    @PutMapping("/{taskId}/assign/{workerId}")
    public ResponseEntity<TaskDto> assignTaskToWorker(@RequestParam Long userId, @PathVariable Long taskId, @PathVariable Long workerId) {
        TaskDto updatedTask = taskService.assignTaskToWorker(taskId, workerId);
        return ResponseEntity.ok(updatedTask);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(@RequestParam Long userId, @PathVariable Long id, @RequestParam Task.TaskStatus status) {
        TaskDto updatedTask = taskService.updateTaskStatus(id, status);
        return ResponseEntity.ok(updatedTask);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@RequestParam Long userId, @PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/count/{status}")
    public ResponseEntity<Long> getTaskCountByStatus(@RequestParam Long userId, @PathVariable Task.TaskStatus status) {
        long count = taskService.getTaskCountByStatus(userId, status);
        return ResponseEntity.ok(count);
    }
}
