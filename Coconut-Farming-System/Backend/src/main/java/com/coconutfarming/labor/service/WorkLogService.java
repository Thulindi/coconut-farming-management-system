package com.coconutfarming.labor.service;

import com.coconutfarming.financial.entity.FinancialRecord;
import com.coconutfarming.financial.service.FinancialService;
import com.coconutfarming.labor.dto.WorkLogDto;
import com.coconutfarming.labor.model.Task;
import com.coconutfarming.labor.model.WorkLog;
import com.coconutfarming.labor.model.Worker;
import com.coconutfarming.labor.repository.WorkLogRepository;
import com.coconutfarming.labor.repository.TaskRepository;
import com.coconutfarming.labor.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkLogService {
    
    private final WorkLogRepository workLogRepository;
    private final WorkerRepository workerRepository;
    private final TaskRepository taskRepository;
    private final FinancialService financialService;
    
    public WorkLogDto createWorkLog(Long userId, WorkLogDto workLogDto) {
        Worker worker = workerRepository.findById(workLogDto.getWorkerId())
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + workLogDto.getWorkerId()));
        
        Task task = taskRepository.findById(workLogDto.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + workLogDto.getTaskId()));
        
        // Calculate salary: use manual override if provided, otherwise auto-calculate
        Double hourlyRate = (worker.getHourlyRate() != null) ? worker.getHourlyRate() : 0.0;
        Double autoSalary = workLogDto.getHoursWorked() * hourlyRate;
        Double finalSalary = (workLogDto.getCalculatedSalary() != null) ? workLogDto.getCalculatedSalary() : autoSalary;
        
        WorkLog workLog = WorkLog.builder()
                .worker(worker)
                .task(task)
                .workDate(workLogDto.getWorkDate() != null ? workLogDto.getWorkDate() : LocalDate.now())
                .hoursWorked(workLogDto.getHoursWorked())
                .calculatedSalary(finalSalary)
                .notes(workLogDto.getNotes())
                .startTime(workLogDto.getStartTime())
                .endTime(workLogDto.getEndTime())
                .userId(userId)
                .build();
        
        WorkLog savedWorkLog = workLogRepository.save(workLog);
        updateTaskActualHours(userId, task.getId());
        
        // Auto-create a corresponding financial expense record
        if (finalSalary > 0) {
            FinancialRecord expense = buildExpenseRecord(userId, savedWorkLog, worker, finalSalary);
            FinancialRecord saved = financialService.createRecord(userId, expense);
            savedWorkLog.setFinancialRecordId(saved.getId());
            savedWorkLog = workLogRepository.save(savedWorkLog);
        }
        
        return WorkLogDto.fromEntity(savedWorkLog);
    }
    
    public WorkLogDto getWorkLogById(Long id) {
        WorkLog workLog = workLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkLog not found with id: " + id));
        return WorkLogDto.fromEntity(workLog);
    }
    
    public List<WorkLogDto> getAllWorkLogs(Long userId) {
        return workLogRepository.findAllByUserId(userId).stream()
                .map(WorkLogDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<WorkLogDto> getWorkLogsByWorkerId(Long userId, Long workerId) {
        return workLogRepository.findByUserIdAndWorkerId(userId, workerId).stream()
                .map(WorkLogDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<WorkLogDto> getWorkLogsByTaskId(Long userId, Long taskId) {
        return workLogRepository.findByUserIdAndTaskId(userId, taskId).stream()
                .map(WorkLogDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<WorkLogDto> getWorkLogsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return workLogRepository.findByUserIdAndWorkDateBetween(userId, startDate, endDate).stream()
                .map(WorkLogDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<WorkLogDto> getWorkLogsByWorkerAndDateRange(Long userId, Long workerId, LocalDate startDate, LocalDate endDate) {
        return workLogRepository.findByUserIdAndWorkerIdAndWorkDateBetween(userId, workerId, startDate, endDate).stream()
                .map(WorkLogDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public WorkLogDto updateWorkLog(Long userId, Long id, WorkLogDto workLogDto) {
        WorkLog existingWorkLog = workLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkLog not found with id: " + id));
        
        Worker worker = existingWorkLog.getWorker();
        
        // Recalculate salary
        Double hourlyRate = (worker.getHourlyRate() != null) ? worker.getHourlyRate() : 0.0;
        Double autoSalary = workLogDto.getHoursWorked() * hourlyRate;
        Double finalSalary = (workLogDto.getCalculatedSalary() != null) ? workLogDto.getCalculatedSalary() : autoSalary;
        
        existingWorkLog.setWorkDate(workLogDto.getWorkDate());
        existingWorkLog.setHoursWorked(workLogDto.getHoursWorked());
        existingWorkLog.setCalculatedSalary(finalSalary);
        existingWorkLog.setNotes(workLogDto.getNotes());
        existingWorkLog.setStartTime(workLogDto.getStartTime());
        existingWorkLog.setEndTime(workLogDto.getEndTime());
        
        WorkLog updatedWorkLog = workLogRepository.save(existingWorkLog);
        updateTaskActualHours(userId, existingWorkLog.getTask().getId());
        
        // Sync the linked financial record
        if (existingWorkLog.getFinancialRecordId() != null) {
            try {
                FinancialRecord expense = buildExpenseRecord(userId, updatedWorkLog, worker, finalSalary);
                financialService.updateRecord(userId, existingWorkLog.getFinancialRecordId(), expense);
            } catch (Exception e) {
                // Record may have been manually deleted; create fresh one
                if (finalSalary > 0) {
                    FinancialRecord expense = buildExpenseRecord(userId, updatedWorkLog, worker, finalSalary);
                    FinancialRecord saved = financialService.createRecord(userId, expense);
                    updatedWorkLog.setFinancialRecordId(saved.getId());
                    updatedWorkLog = workLogRepository.save(updatedWorkLog);
                }
            }
        } else if (finalSalary > 0) {
            FinancialRecord expense = buildExpenseRecord(userId, updatedWorkLog, worker, finalSalary);
            FinancialRecord saved = financialService.createRecord(userId, expense);
            updatedWorkLog.setFinancialRecordId(saved.getId());
            updatedWorkLog = workLogRepository.save(updatedWorkLog);
        }
        
        return WorkLogDto.fromEntity(updatedWorkLog);
    }
    
    public void deleteWorkLog(Long userId, Long id) {
        WorkLog workLog = workLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkLog not found with id: " + id));
        
        Long taskId = workLog.getTask().getId();
        
        // Delete the linked financial record first
        if (workLog.getFinancialRecordId() != null) {
            try {
                financialService.deleteRecord(userId, workLog.getFinancialRecordId());
            } catch (Exception e) {
                // Already deleted manually — ignore
            }
        }
        
        workLogRepository.delete(workLog);
        updateTaskActualHours(userId, taskId);
    }
    
    public Double getTotalHoursByWorkerAndPeriod(Long userId, Long workerId, LocalDate startDate, LocalDate endDate) {
        return workLogRepository.getTotalHoursByWorkerAndPeriodAndUserId(workerId, startDate, endDate, userId);
    }
    
    public Double getTotalHoursByTask(Long userId, Long taskId) {
        return workLogRepository.getTotalHoursByTaskAndUserId(taskId, userId);
    }
    
    public List<WorkLogDto> getWorkLogsByDate(Long userId, LocalDate date) {
        return workLogRepository.findByWorkDateAndUserId(date, userId).stream()
                .map(WorkLogDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    private void updateTaskActualHours(Long userId, Long taskId) {
        Double totalHours = workLogRepository.getTotalHoursByTaskAndUserId(taskId, userId);
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            task.setActualHours(totalHours);
            taskRepository.save(task);
        }
    }
    
    private FinancialRecord buildExpenseRecord(Long userId, WorkLog workLog, Worker worker, Double salary) {
        FinancialRecord record = new FinancialRecord();
        record.setUserId(userId);
        record.setRecordType(FinancialRecord.RecordType.EXPENSE);
        record.setCategory("Labor");
        record.setAmount(BigDecimal.valueOf(salary));
        record.setRecordDate(workLog.getWorkDate() != null ? workLog.getWorkDate() : LocalDate.now());
        record.setDescription("Salary - " + worker.getName() +
            " | " + workLog.getHoursWorked() + "h" +
            (workLog.getTask() != null ? " | " + workLog.getTask().getTitle() : ""));
        return record;
    }
}
