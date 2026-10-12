package com.coconutfarming.notification.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Who is this notification for? e.g., Username, "ALL", "ADMIN", "OFFICER"
    private String recipient; 
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String type; // e.g., "INFO", "WARNING", "SUCCESS"
    
    // For per-user read status on broadcasts
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "notification_read_by", joinColumns = @JoinColumn(name = "notification_id"))
    @Column(name = "username")
    private Set<String> readByUsers = new HashSet<>();
    
    // Legacy support or fallback for single-user notifications
    private boolean isRead = false;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
