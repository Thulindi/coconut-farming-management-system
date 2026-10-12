package com.coconutfarming.plantation.repository;

import java.time.LocalDate;
import java.util.List;

import com.coconutfarming.plantation.model.FertilizerSchedule;
import com.coconutfarming.plantation.model.Land;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FertilizerScheduleRepository extends JpaRepository<FertilizerSchedule, Long> {
    List<FertilizerSchedule> findByLand(Land land);
    List<FertilizerSchedule> findByLandAndNextDueDateBefore(Land land, LocalDate date);
    List<FertilizerSchedule> findByLandAndNextDueDateGreaterThanEqual(Land land, LocalDate date);

    java.util.Optional<FertilizerSchedule> findByIdAndFarmerId(Long id, Long farmerId);
    List<FertilizerSchedule> findByFarmerId(Long farmerId);
    long countByFarmerIdAndStatus(Long farmerId, com.coconutfarming.plantation.model.ScheduleStatus status);
}
