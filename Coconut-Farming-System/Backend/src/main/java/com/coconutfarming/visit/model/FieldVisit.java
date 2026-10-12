package com.coconutfarming.visit.model;

import com.coconutfarming.user.model.User;
import com.coconutfarming.plantation.model.Land;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "field_visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FieldVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id")
    private User officer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_id")
    private Land land;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    private String status; // PENDING, SCHEDULED, REJECTED, COMPLETED

    @Column(length = 1000)
    private String officerMessage;

    @Column(length = 2000)
    private String completionNote;

    @Column(nullable = false)
    private boolean isDeletedByOfficer = false;

    @Column(nullable = false)
    private boolean isDeletedByFarmer = false;

    private LocalDateTime requestedDate;
    private LocalDateTime scheduledDate;
    private LocalDateTime completedDate;

    @PrePersist
    protected void onCreate() {
        requestedDate = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }
}
