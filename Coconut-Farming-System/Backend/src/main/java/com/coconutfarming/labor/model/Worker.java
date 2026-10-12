package com.coconutfarming.labor.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "workers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @NotBlank(message = "Worker name is required")
    @Column(nullable = false)
    private String name;
    
    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "hire_date")
    @NotNull(message = "Hire date is required")
    private LocalDateTime hireDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkerStatus status = WorkerStatus.ACTIVE;
    
    @Column(columnDefinition = "TEXT")
    private String skills;
    
    @Column(name = "hourly_rate")
    private Double hourlyRate;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Task> assignedTasks;
    
    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WorkLog> workLogs;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum WorkerStatus {
        ACTIVE, INACTIVE, ON_LEAVE
    }
}
