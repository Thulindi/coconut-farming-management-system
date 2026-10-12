package com.coconutfarming.labor.repository;

import com.coconutfarming.labor.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findAllByUserId(Long userId);
    
    List<Task> findByUserIdAndWorkerId(Long userId, Long workerId);
    
    List<Task> findByUserIdAndStatus(Long userId, Task.TaskStatus status);
    
    List<Task> findByUserIdAndPriority(Long userId, Task.TaskPriority priority);
    
    List<Task> findByUserIdAndCategory(Long userId, String category);
    
    @Query("SELECT t FROM Task t WHERE t.userId = :userId AND t.dueDate BETWEEN :startDate AND :endDate")
    List<Task> findByDueDateBetweenAndUserId(@Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate, 
                                             @Param("userId") Long userId);
    
    @Query("SELECT t FROM Task t WHERE t.userId = :userId AND t.worker.id = :workerId AND t.status = :status")
    List<Task> findByWorkerIdAndStatusAndUserId(@Param("workerId") Long workerId, 
                                                @Param("status") Task.TaskStatus status, 
                                                @Param("userId") Long userId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.userId = :userId AND t.status = :status")
    long countByStatusAndUserId(@Param("status") Task.TaskStatus status, @Param("userId") Long userId);
    
    @Query("SELECT t FROM Task t WHERE t.userId = :userId AND t.dueDate < :currentDate AND t.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Task> findOverdueTasksByUserId(@Param("currentDate") LocalDateTime currentDate, @Param("userId") Long userId);
    
    @Query("SELECT t FROM Task t WHERE t.userId = :userId AND t.status IN ('PENDING', 'IN_PROGRESS') ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> findActiveTasksOrderedByPriorityAndUserId(@Param("userId") Long userId);
}
