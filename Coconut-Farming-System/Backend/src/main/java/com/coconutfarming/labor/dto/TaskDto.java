package com.coconutfarming.labor.dto;

import com.coconutfarming.labor.model.Task;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {
    
    private Long id;
    private String title;
    private String description;
    private Task.TaskPriority priority;
    private Task.TaskStatus status;
    private Long workerId;
    private String workerName;
    private String category;
    private LocalDateTime dueDate;
    private Double estimatedHours;
    private Double actualHours;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static TaskDto fromEntity(Task task) {
        if (task == null) return null;
        
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .workerId(task.getWorker() != null ? task.getWorker().getId() : null)
                .workerName(task.getWorker() != null ? task.getWorker().getName() : null)
                .category(task.getCategory())
                .dueDate(task.getDueDate())
                .estimatedHours(task.getEstimatedHours())
                .actualHours(task.getActualHours())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
