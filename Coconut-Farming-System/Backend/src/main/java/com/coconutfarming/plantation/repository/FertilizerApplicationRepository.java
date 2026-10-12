package com.coconutfarming.plantation.repository;

import java.util.List;

import com.coconutfarming.plantation.model.FertilizerApplication;
import com.coconutfarming.plantation.model.FertilizerSchedule;
import com.coconutfarming.plantation.model.Land;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FertilizerApplicationRepository extends JpaRepository<FertilizerApplication, Long> {
    List<FertilizerApplication> findByScheduleOrderByAppliedDateDesc(FertilizerSchedule schedule);
    List<FertilizerApplication> findTop5ByScheduleOrderByAppliedDateDesc(FertilizerSchedule schedule);
    List<FertilizerApplication> findTop10ByScheduleLandOrderByAppliedDateDesc(Land land);
}
