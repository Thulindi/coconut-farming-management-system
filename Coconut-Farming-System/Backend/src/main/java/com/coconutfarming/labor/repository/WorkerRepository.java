package com.coconutfarming.labor.repository;

import com.coconutfarming.labor.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    
    List<Worker> findAllByUserId(Long userId);
    
    Optional<Worker> findByUserIdAndEmail(Long userId, String email);
    
    boolean existsByUserIdAndEmail(Long userId, String email);
    
    List<Worker> findByUserIdAndStatus(Long userId, Worker.WorkerStatus status);
    
    @Query("SELECT w FROM Worker w WHERE w.userId = :userId AND w.skills LIKE %:skill%")
    List<Worker> findBySkillsContainingAndUserId(@Param("skill") String skill, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(w) FROM Worker w WHERE w.userId = :userId AND w.status = :status")
    long countByStatusAndUserId(@Param("status") Worker.WorkerStatus status, @Param("userId") Long userId);
    
    @Query("SELECT w FROM Worker w WHERE w.userId = :userId AND w.hireDate BETWEEN :startDate AND :endDate")
    List<Worker> findByHireDateBetweenAndUserId(@Param("startDate") LocalDateTime startDate, 
                                                @Param("endDate") LocalDateTime endDate,
                                                @Param("userId") Long userId);
    
    @Query("SELECT w FROM Worker w WHERE w.userId = :userId AND w.id NOT IN " +
           "(SELECT t.worker.id FROM Task t WHERE t.userId = :userId AND t.status IN ('PENDING', 'IN_PROGRESS'))")
    List<Worker> findAvailableWorkersByUserId(@Param("userId") Long userId);
}
