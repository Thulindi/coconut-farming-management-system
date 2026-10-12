package com.coconutfarming.labor.dto;

import com.coconutfarming.labor.model.Worker;
import com.coconutfarming.labor.model.Task;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerDto {
    
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private LocalDateTime hireDate;
    private Worker.WorkerStatus status;
    private String skills;
    private Double hourlyRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TaskSummaryDto> assignedTasks;
    private Integer activeTaskCount;
    
    public static WorkerDto fromEntity(Worker worker) {
        if (worker == null) return null;
        
        return WorkerDto.builder()
                .id(worker.getId())
                .name(worker.getName())
                .email(worker.getEmail())
                .phoneNumber(worker.getPhoneNumber())
                .hireDate(worker.getHireDate())
                .status(worker.getStatus())
                .skills(worker.getSkills())
                .hourlyRate(worker.getHourlyRate())
                .createdAt(worker.getCreatedAt())
                .updatedAt(worker.getUpdatedAt())
                .build();
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaskSummaryDto {
        private Long id;
        private String title;
        private Task.TaskStatus status;
        private Task.TaskPriority priority;
        private LocalDateTime dueDate;
    }
}
