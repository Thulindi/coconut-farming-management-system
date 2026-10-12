package com.coconutfarming.plantation.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.coconutfarming.plantation.dto.FertilizerApplicationRequest;
import com.coconutfarming.plantation.dto.FertilizerScheduleRequest;
import com.coconutfarming.plantation.dto.FertilizingTimelineResponse;
import com.coconutfarming.plantation.dto.FertilizerApplicationResponse;
import com.coconutfarming.plantation.dto.FertilizerScheduleResponse;
import com.coconutfarming.plantation.exception.ResourceNotFoundException;
import com.coconutfarming.plantation.model.*;
import com.coconutfarming.plantation.repository.FertilizerApplicationRepository;
import com.coconutfarming.plantation.repository.FertilizerScheduleChangeLogRepository;
import com.coconutfarming.plantation.repository.FertilizerScheduleRepository;
import com.coconutfarming.plantation.repository.LandRepository;
import com.coconutfarming.plantation.util.MapperUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import com.coconutfarming.notification.service.NotificationService;

@Service
public class FertilizerService {
    private final FertilizerScheduleRepository scheduleRepository;
    private final FertilizerApplicationRepository applicationRepository;
    private final FertilizerScheduleChangeLogRepository changeLogRepository;
    private final LandRepository landRepository;
    private final NotificationService notificationService;

    public FertilizerService(FertilizerScheduleRepository scheduleRepository,
                             FertilizerApplicationRepository applicationRepository,
                             FertilizerScheduleChangeLogRepository changeLogRepository,
                             LandRepository landRepository,
                             NotificationService notificationService) {
        this.scheduleRepository = scheduleRepository;
        this.applicationRepository = applicationRepository;
        this.changeLogRepository = changeLogRepository;
        this.landRepository = landRepository;
        this.notificationService = notificationService;
    }

    public List<FertilizerScheduleResponse> getSchedules(Long farmerId, Long landId) {
        Land land = landRepository.findByIdAndFarmerId(landId, farmerId)
            .orElseThrow(() -> new ResourceNotFoundException("Land not found"));
        return scheduleRepository.findByLand(land).stream()
            .map(MapperUtil::toFertilizerScheduleResponse)
            .toList();
    }

    public Long countActiveSchedules(Long farmerId) {
        return scheduleRepository.countByFarmerIdAndStatus(farmerId, ScheduleStatus.ACTIVE);
    }

    @Transactional
    public FertilizerScheduleResponse createSchedule(Long farmerId, Long landId, FertilizerScheduleRequest request) {
        Land land = landRepository.findByIdAndFarmerId(landId, farmerId)
            .orElseThrow(() -> new ResourceNotFoundException("Land not found"));
        
        FertilizerSchedule schedule = new FertilizerSchedule();
        schedule.setLand(land);
        schedule.setFarmerId(farmerId);
        applyScheduleRequest(schedule, request);
        
        FertilizerSchedule saved = scheduleRepository.save(schedule);
        logChange(saved, FertilizerScheduleChangeLog.ChangeType.CREATED, null, serialize(saved));
        
        return MapperUtil.toFertilizerScheduleResponse(saved);
    }

    @Transactional
    public FertilizerScheduleResponse updateSchedule(Long farmerId, Long scheduleId, FertilizerScheduleRequest request) {
        FertilizerSchedule schedule = getSchedule(scheduleId, farmerId);
        String previous = serialize(schedule);
        applyScheduleRequest(schedule, request);
        scheduleRepository.save(schedule);
        logChange(schedule, FertilizerScheduleChangeLog.ChangeType.UPDATED, previous, serialize(schedule));
        return MapperUtil.toScheduleResponse(schedule, getLastAppliedDate(schedule));
    }

    @Transactional
    public void deleteSchedule(Long farmerId, Long scheduleId) {
        FertilizerSchedule schedule = getSchedule(scheduleId, farmerId);
        logChange(schedule, FertilizerScheduleChangeLog.ChangeType.DELETED, serialize(schedule), null);
        scheduleRepository.delete(schedule);
    }

    public List<FertilizerApplicationResponse> getApplications(Long farmerId, Long scheduleId) {
        FertilizerSchedule schedule = getSchedule(scheduleId, farmerId);
        return applicationRepository.findByScheduleOrderByAppliedDateDesc(schedule)
            .stream()
            .map(MapperUtil::toApplicationResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public FertilizerApplicationResponse logApplication(Long farmerId, Long scheduleId, FertilizerApplicationRequest request) {
        FertilizerSchedule schedule = getSchedule(scheduleId, farmerId);
        FertilizerApplication application = new FertilizerApplication();
        application.setSchedule(schedule);
        application.setFarmerId(farmerId);
        application.setAppliedDate(request.getAppliedDate());
        application.setFertilizerType(request.getFertilizerType());
        application.setQuantityUsed(request.getQuantityUsed());
        application.setRemarks(request.getRemarks());

        applicationRepository.save(application);

        // update next due date
        schedule.setNextDueDate(calculateNextDueDate(request.getAppliedDate(), schedule.getFrequency()));
        scheduleRepository.save(schedule);

        return MapperUtil.toApplicationResponse(application);
    }

    public FertilizingTimelineResponse getTimeline(Long farmerId, Long landId) {
        Land land = getLand(landId, farmerId);
        LocalDate today = LocalDate.now();

        List<FertilizerScheduleResponse> overdue = scheduleRepository.findByLandAndNextDueDateBefore(land, today)
            .stream()
            .filter(s -> s.getStatus() == ScheduleStatus.ACTIVE)
            .sorted(Comparator.comparing(FertilizerSchedule::getNextDueDate))
            .map(s -> MapperUtil.toScheduleResponse(s, getLastAppliedDate(s)))
            .collect(Collectors.toList());

        List<FertilizerScheduleResponse> upcoming = scheduleRepository.findByLandAndNextDueDateGreaterThanEqual(land, today)
            .stream()
            .filter(s -> s.getStatus() == ScheduleStatus.ACTIVE)
            .sorted(Comparator.comparing(FertilizerSchedule::getNextDueDate))
            .map(s -> MapperUtil.toScheduleResponse(s, getLastAppliedDate(s)))
            .collect(Collectors.toList());

        List<FertilizerApplicationResponse> completed = applicationRepository
            .findTop10ByScheduleLandOrderByAppliedDateDesc(land)
            .stream()
            .map(MapperUtil::toApplicationResponse)
            .collect(Collectors.toList());

        return new FertilizingTimelineResponse(overdue, upcoming, completed);
    }

    private void applyScheduleRequest(FertilizerSchedule schedule, FertilizerScheduleRequest request) {
        schedule.setFertilizerType(request.getFertilizerType());
        schedule.setFrequency(request.getFrequency());
        schedule.setRecommendedQuantity(request.getRecommendedQuantity());
        schedule.setNextDueDate(request.getNextDueDate());
        schedule.setApplicationMethod(request.getApplicationMethod());
        schedule.setNotes(request.getNotes());
        schedule.setStatus(request.getStatus());
    }

    private LocalDate getLastAppliedDate(FertilizerSchedule schedule) {
        List<FertilizerApplication> apps = applicationRepository.findTop5ByScheduleOrderByAppliedDateDesc(schedule);
        if (apps.isEmpty()) {
            return null;
        }
        return apps.get(0).getAppliedDate();
    }

    private LocalDate calculateNextDueDate(LocalDate appliedDate, Frequency frequency) {
        if (frequency == null) {
            return appliedDate;
        }
        return switch (frequency) {
            case WEEKLY -> appliedDate.plusWeeks(1);
            case MONTHLY -> appliedDate.plusMonths(1);
            case BIMONTHLY -> appliedDate.plusMonths(2);
            case QUARTERLY -> appliedDate.plusMonths(3);
            case SEMI_ANNUAL -> appliedDate.plusMonths(6);
            case ANNUAL -> appliedDate.plusYears(1);
        };
    }

    private void logChange(FertilizerSchedule schedule, FertilizerScheduleChangeLog.ChangeType type, String previous, String current) {
        FertilizerScheduleChangeLog log = new FertilizerScheduleChangeLog();
        log.setSchedule(schedule);
        log.setFarmerId(schedule.getFarmerId());
        log.setChangeType(type);
        log.setCreatedAt(LocalDateTime.now());
        log.setPreviousSnapshot(previous);
        log.setNewSnapshot(current);
        changeLogRepository.save(log);
    }

    private String serialize(FertilizerSchedule schedule) {
        return "fertilizerType=" + schedule.getFertilizerType() +
            ", frequency=" + schedule.getFrequency() +
            ", recommendedQuantity=" + schedule.getRecommendedQuantity() +
            ", nextDueDate=" + schedule.getNextDueDate() +
            ", applicationMethod=" + schedule.getApplicationMethod() +
            ", status=" + schedule.getStatus();
    }

    private FertilizerSchedule getSchedule(Long id, Long farmerId) {
        return scheduleRepository.findByIdAndFarmerId(id, farmerId)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));
    }

    private Land getLand(Long id, Long farmerId) {
        return landRepository.findByIdAndFarmerId(id, farmerId)
            .orElseThrow(() -> new ResourceNotFoundException("Land not found"));
    }

    // Runs daily at 8 AM to send fertilizer reminders
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void sendFertilizerReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<FertilizerSchedule> allSchedules = scheduleRepository.findAll();
        
        allSchedules.stream()
            .filter(s -> s.getStatus() == ScheduleStatus.ACTIVE && s.getNextDueDate() != null && s.getNextDueDate().isEqual(tomorrow))
            .forEach(schedule -> {
                try {
                    notificationService.createNotification(
                        schedule.getFarmerId().toString(), 
                        "Reminder: Fertilizer application (" + schedule.getFertilizerType() + ") is due tomorrow for land at " + schedule.getLand().getLocationName(), 
                        "INFO"
                    );
                } catch (Exception e) {}
            });
    }
}
