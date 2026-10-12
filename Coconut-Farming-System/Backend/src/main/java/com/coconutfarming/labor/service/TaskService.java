package com.coconutfarming.labor.service;

import com.coconutfarming.labor.dto.TaskDto;
import com.coconutfarming.labor.model.Task;
import com.coconutfarming.labor.model.Worker;
import com.coconutfarming.labor.repository.TaskRepository;
import com.coconutfarming.labor.repository.WorkerRepository;
import com.coconutfarming.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final WorkerRepository workerRepository;
    private final NotificationService notificationService;
    
    public TaskDto createTask(Long userId, TaskDto taskDto) {
        Task task = Task.builder()
                .title(taskDto.getTitle())
                .description(taskDto.getDescription())
                .priority(taskDto.getPriority() != null ? taskDto.getPriority() : Task.TaskPriority.MEDIUM)
                .status(Task.TaskStatus.PENDING)
                .dueDate(taskDto.getDueDate())
                .estimatedHours(taskDto.getEstimatedHours())
                .userId(userId)
                .build();
        
        if (taskDto.getWorkerId() != null) {
            Worker worker = workerRepository.findById(taskDto.getWorkerId())
                    .orElseThrow(() -> new RuntimeException("Worker not found with id: " + taskDto.getWorkerId()));
            task.setWorker(worker);
        }
        
        if (taskDto.getCategory() != null && !taskDto.getCategory().isEmpty()) {
            task.setCategory(taskDto.getCategory());
        }
        
        Task savedTask = taskRepository.save(task);
        return TaskDto.fromEntity(savedTask);
    }
    
    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return TaskDto.fromEntity(task);
    }
    
    public List<TaskDto> getAllTasks(Long userId) {
        return taskRepository.findAllByUserId(userId).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TaskDto> getTasksByWorkerId(Long userId, Long workerId) {
        return taskRepository.findByUserIdAndWorkerId(userId, workerId).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TaskDto> getTasksByStatus(Long userId, Task.TaskStatus status) {
        return taskRepository.findByUserIdAndStatus(userId, status).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TaskDto> getTasksByPriority(Long userId, Task.TaskPriority priority) {
        return taskRepository.findByUserIdAndPriority(userId, priority).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TaskDto> getOverdueTasks(Long userId) {
        return taskRepository.findOverdueTasksByUserId(LocalDateTime.now(), userId).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<TaskDto> getActiveTasksOrderedByPriority(Long userId) {
        return taskRepository.findActiveTasksOrderedByPriorityAndUserId(userId).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public TaskDto updateTask(Long id, TaskDto taskDto) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        existingTask.setTitle(taskDto.getTitle());
        existingTask.setDescription(taskDto.getDescription());
        existingTask.setPriority(taskDto.getPriority());
        existingTask.setStatus(taskDto.getStatus());
        existingTask.setDueDate(taskDto.getDueDate());
        existingTask.setEstimatedHours(taskDto.getEstimatedHours());
        existingTask.setActualHours(taskDto.getActualHours());
        
        if (taskDto.getWorkerId() != null) {
            Worker worker = workerRepository.findById(taskDto.getWorkerId())
                    .orElseThrow(() -> new RuntimeException("Worker not found with id: " + taskDto.getWorkerId()));
            existingTask.setWorker(worker);
        }
        
        if (taskDto.getCategory() != null && !taskDto.getCategory().isEmpty()) {
            existingTask.setCategory(taskDto.getCategory());
        }
        
        Task updatedTask = taskRepository.save(existingTask);
        return TaskDto.fromEntity(updatedTask);
    }
    
    public TaskDto assignTaskToWorker(Long taskId, Long workerId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + workerId));
        
        task.setWorker(worker);
        task.setStatus(Task.TaskStatus.IN_PROGRESS);
        
        Task updatedTask = taskRepository.save(task);
        return TaskDto.fromEntity(updatedTask);
    }
    
    public TaskDto updateTaskStatus(Long id, Task.TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        Task.TaskStatus existingStatus = task.getStatus();
        task.setStatus(status);
        
        if (status == Task.TaskStatus.COMPLETED && existingStatus != Task.TaskStatus.COMPLETED) {
            task.setActualHours(calculateActualHours(task));
            try {
                notificationService.createNotification(task.getUserId().toString(), "Labor Task Completed: " + task.getTitle(), "SUCCESS");
            } catch (Exception e) {}
        }
        
        Task updatedTask = taskRepository.save(task);
        return TaskDto.fromEntity(updatedTask);
    }
    
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        taskRepository.delete(task);
    }
    
    private Double calculateActualHours(Task task) {
        return task.getWorkLogs().stream()
                .mapToDouble(log -> log.getHoursWorked())
                .sum();
    }
    
    public long getTaskCountByStatus(Long userId, Task.TaskStatus status) {
        return taskRepository.countByStatusAndUserId(status, userId);
    }
}
