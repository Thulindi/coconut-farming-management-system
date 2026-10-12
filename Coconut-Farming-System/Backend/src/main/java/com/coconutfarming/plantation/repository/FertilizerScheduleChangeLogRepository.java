package com.coconutfarming.plantation.repository;

import java.util.List;

import com.coconutfarming.plantation.model.FertilizerSchedule;
import com.coconutfarming.plantation.model.FertilizerScheduleChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FertilizerScheduleChangeLogRepository extends JpaRepository<FertilizerScheduleChangeLog, Long> {
    List<FertilizerScheduleChangeLog> findByScheduleOrderByCreatedAtDesc(FertilizerSchedule schedule);
}
