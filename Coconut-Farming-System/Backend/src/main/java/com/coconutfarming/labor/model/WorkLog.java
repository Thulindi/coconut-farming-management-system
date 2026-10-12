package com.coconutfarming.labor.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    @NotNull(message = "Worker is required")
    private Worker worker;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @NotNull(message = "Task is required")
    private Task task;
    
    @NotNull(message = "Work date is required")
    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;
    
    @NotNull(message = "Hours worked is required")
    @Column(name = "hours_worked", nullable = false)
    private Double hoursWorked;
    
    @Column(name = "calculated_salary")
    private Double calculatedSalary;
    
    @Column(name = "financial_record_id")
    private Long financialRecordId;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
