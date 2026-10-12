package com.coconutfarming.labor.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    
    public enum TaskPriority {
        LOW, MEDIUM, HIGH, URGENT
    }
    
    public enum TaskStatus {
        PENDING, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @NotBlank(message = "Task title is required")
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_worker_id")
    private Worker worker;
    
    @Column(name = "category")
    private String category;
    
    @NotNull(message = "Due date is required")
    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;
    
    @Column(name = "estimated_hours")
    private Double estimatedHours;
    
    @Column(name = "actual_hours")
    private Double actualHours;
    
    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WorkLog> workLogs;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
