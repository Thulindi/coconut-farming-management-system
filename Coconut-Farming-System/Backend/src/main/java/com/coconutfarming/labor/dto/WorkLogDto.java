package com.coconutfarming.labor.dto;

import com.coconutfarming.labor.model.WorkLog;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkLogDto {
    
    private Long id;
    private Long workerId;
    private String workerName;
    private Double workerHourlyRate;
    private Long taskId;
    private String taskTitle;
    private LocalDate workDate;
    private Double hoursWorked;
    private Double calculatedSalary;
    private Long financialRecordId;
    private String notes;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static WorkLogDto fromEntity(WorkLog workLog) {
        if (workLog == null) return null;
        
        return WorkLogDto.builder()
                .id(workLog.getId())
                .workerId(workLog.getWorker() != null ? workLog.getWorker().getId() : null)
                .workerName(workLog.getWorker() != null ? workLog.getWorker().getName() : null)
                .workerHourlyRate(workLog.getWorker() != null ? workLog.getWorker().getHourlyRate() : null)
                .taskId(workLog.getTask() != null ? workLog.getTask().getId() : null)
                .taskTitle(workLog.getTask() != null ? workLog.getTask().getTitle() : null)
                .workDate(workLog.getWorkDate())
                .hoursWorked(workLog.getHoursWorked())
                .calculatedSalary(workLog.getCalculatedSalary())
                .financialRecordId(workLog.getFinancialRecordId())
                .notes(workLog.getNotes())
                .startTime(workLog.getStartTime())
                .endTime(workLog.getEndTime())
                .createdAt(workLog.getCreatedAt())
                .updatedAt(workLog.getUpdatedAt())
                .build();
    }
}
