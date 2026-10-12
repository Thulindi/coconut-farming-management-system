package com.coconutfarming.labor.repository;

import com.coconutfarming.labor.model.WorkLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {
    
    List<WorkLog> findAllByUserId(Long userId);
    
    List<WorkLog> findByUserIdAndWorkerId(Long userId, Long workerId);
    
    List<WorkLog> findByUserIdAndTaskId(Long userId, Long taskId);
    
    List<WorkLog> findByUserIdAndWorkDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    
    List<WorkLog> findByUserIdAndWorkerIdAndWorkDateBetween(Long userId, Long workerId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT SUM(wl.hoursWorked) FROM WorkLog wl WHERE wl.userId = :userId AND wl.worker.id = :workerId AND wl.workDate BETWEEN :startDate AND :endDate")
    Double getTotalHoursByWorkerAndPeriodAndUserId(@Param("workerId") Long workerId, 
                                                   @Param("startDate") LocalDate startDate, 
                                                   @Param("endDate") LocalDate endDate,
                                                   @Param("userId") Long userId);
    
    @Query("SELECT SUM(wl.hoursWorked) FROM WorkLog wl WHERE wl.userId = :userId AND wl.task.id = :taskId")
    Double getTotalHoursByTaskAndUserId(@Param("taskId") Long taskId, @Param("userId") Long userId);
    
    @Query("SELECT wl FROM WorkLog wl WHERE wl.userId = :userId AND wl.workDate = :date")
    List<WorkLog> findByWorkDateAndUserId(@Param("date") LocalDate date, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(wl) FROM WorkLog wl WHERE wl.userId = :userId AND wl.workDate = :date")
    long countByWorkDateAndUserId(@Param("date") LocalDate date, @Param("userId") Long userId);
}
