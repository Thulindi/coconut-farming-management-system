package com.coconutfarming.plantation.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "fertilizer_schedule_change_logs", indexes = {
    @Index(name = "idx_schedule_change_schedule", columnList = "schedule_id")
})
public class FertilizerScheduleChangeLog extends BaseEntity {
    public enum ChangeType {
        CREATED,
        UPDATED,
        DELETED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private FertilizerSchedule schedule;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false)
    private ChangeType changeType;

    @Column(name = "previous_snapshot", length = 1500)
    private String previousSnapshot;

    @Column(name = "new_snapshot", length = 1500)
    private String newSnapshot;

    public FertilizerScheduleChangeLog() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FertilizerSchedule getSchedule() {
        return schedule;
    }

    public void setSchedule(FertilizerSchedule schedule) {
        this.schedule = schedule;
    }

    public ChangeType getChangeType() {
        return changeType;
    }

    public void setChangeType(ChangeType changeType) {
        this.changeType = changeType;
    }

    public String getPreviousSnapshot() {
        return previousSnapshot;
    }

    public void setPreviousSnapshot(String previousSnapshot) {
        this.previousSnapshot = previousSnapshot;
    }

    public String getNewSnapshot() {
        return newSnapshot;
    }

    public void setNewSnapshot(String newSnapshot) {
        this.newSnapshot = newSnapshot;
    }
}
