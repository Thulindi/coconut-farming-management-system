package com.coconutfarming.labor.service;

import com.coconutfarming.labor.dto.WorkerDto;
import com.coconutfarming.labor.model.Worker;
import com.coconutfarming.labor.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkerService {
    
    private final WorkerRepository workerRepository;
    
    public WorkerDto createWorker(Long userId, WorkerDto workerDto) {
        if (workerDto.getEmail() != null && !workerDto.getEmail().isEmpty() && 
            workerRepository.existsByUserIdAndEmail(userId, workerDto.getEmail())) {
            throw new RuntimeException("Worker with email " + workerDto.getEmail() + " already exists");
        }
        
        Worker worker = Worker.builder()
                .name(workerDto.getName())
                .email(workerDto.getEmail())
                .phoneNumber(workerDto.getPhoneNumber())
                .hireDate(workerDto.getHireDate() != null ? workerDto.getHireDate() : LocalDateTime.now())
                .status(workerDto.getStatus() != null ? workerDto.getStatus() : Worker.WorkerStatus.ACTIVE)
                .skills(workerDto.getSkills())
                .hourlyRate(workerDto.getHourlyRate())
                .userId(userId)
                .build();
        
        Worker savedWorker = workerRepository.save(worker);
        return WorkerDto.fromEntity(savedWorker);
    }
    
    public WorkerDto getWorkerById(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));
        return WorkerDto.fromEntity(worker);
    }
    
    public List<WorkerDto> getAllWorkers(Long userId) {
        return workerRepository.findAllByUserId(userId).stream()
                .map(WorkerDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<WorkerDto> getWorkersByStatus(Long userId, Worker.WorkerStatus status) {
        return workerRepository.findByUserIdAndStatus(userId, status).stream()
                .map(WorkerDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<WorkerDto> getAvailableWorkers(Long userId) {
        return workerRepository.findAvailableWorkersByUserId(userId).stream()
                .map(WorkerDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public WorkerDto updateWorker(Long userId, Long id, WorkerDto workerDto) {
        Worker existingWorker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));
        
        String newEmail = workerDto.getEmail();
        String oldEmail = existingWorker.getEmail();
        
        if (newEmail != null && !newEmail.isEmpty() && !newEmail.equals(oldEmail) && 
            workerRepository.existsByUserIdAndEmail(userId, newEmail)) {
            throw new RuntimeException("Worker with email " + newEmail + " already exists");
        }
        
        existingWorker.setName(workerDto.getName());
        existingWorker.setEmail(workerDto.getEmail());
        existingWorker.setPhoneNumber(workerDto.getPhoneNumber());
        existingWorker.setStatus(workerDto.getStatus());
        existingWorker.setSkills(workerDto.getSkills());
        existingWorker.setHourlyRate(workerDto.getHourlyRate());
        
        Worker updatedWorker = workerRepository.save(existingWorker);
        return WorkerDto.fromEntity(updatedWorker);
    }
    
    public void deleteWorker(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));
        
        if (!worker.getAssignedTasks().isEmpty()) {
            throw new RuntimeException("Cannot delete worker with assigned tasks. Please reassign tasks first.");
        }
        
        workerRepository.delete(worker);
    }
    
    public WorkerDto changeWorkerStatus(Long id, Worker.WorkerStatus status) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));
        
        worker.setStatus(status);
        Worker updatedWorker = workerRepository.save(worker);
        return WorkerDto.fromEntity(updatedWorker);
    }
    
    public List<WorkerDto> searchWorkersBySkill(Long userId, String skill) {
        return workerRepository.findBySkillsContainingAndUserId(skill, userId).stream()
                .map(WorkerDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    public long getWorkerCountByStatus(Long userId, Worker.WorkerStatus status) {
        return workerRepository.countByStatusAndUserId(status, userId);
    }
}
