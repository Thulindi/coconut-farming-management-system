package com.coconutfarming.visit.service;

import com.coconutfarming.visit.model.FieldVisit;
import com.coconutfarming.visit.repository.FieldVisitRepository;
import com.coconutfarming.visit.dto.FieldVisitDto;
import com.coconutfarming.visit.dto.FieldVisitRequestDto;
import com.coconutfarming.visit.dto.FieldVisitActionDto;
import com.coconutfarming.visit.dto.FieldVisitCompleteDto;
import com.coconutfarming.user.model.User;
import com.coconutfarming.user.repository.UserRepository;
import com.coconutfarming.user.repository.ProfileRepository;
import com.coconutfarming.plantation.repository.LandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.coconutfarming.notification.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FieldVisitService {

    @Autowired
    private FieldVisitRepository fieldVisitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private LandRepository landRepository;

    @Transactional
    public FieldVisitDto createFieldVisit(Long farmerId, FieldVisitRequestDto requestDto) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        FieldVisit visit = new FieldVisit();
        visit.setFarmer(farmer);
        visit.setDistrict(requestDto.getDistrict());
        visit.setReason(requestDto.getReason());

        if (requestDto.getLandId() != null) {
            landRepository.findById(requestDto.getLandId()).ifPresent(visit::setLand);
        }

        FieldVisit savedVisit = fieldVisitRepository.save(visit);
        try {
            notificationService.notifyOfficers("New Field Visit Requested in " + requestDto.getDistrict() + " by " + farmer.getUsername(), "INFO");
        } catch (Exception e) {}
        return mapToDto(savedVisit);
    }

    @Transactional(readOnly = true)
    public List<FieldVisitDto> getVisitsByFarmer(Long farmerId) {
        return fieldVisitRepository.findByFarmerIdAndIsDeletedByFarmerFalseOrderByRequestedDateDesc(farmerId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FieldVisitDto> getPendingVisitsByDistrict(String district) {
        return fieldVisitRepository.findByDistrictAndStatusOrderByRequestedDateDesc(district, "PENDING")
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FieldVisitDto> getVisitsByOfficer(Long officerId) {
        return fieldVisitRepository.findByOfficerIdAndIsDeletedByOfficerFalseOrderByRequestedDateDesc(officerId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FieldVisitDto acceptVisit(Long id, Long officerId, FieldVisitActionDto actionDto) {
        FieldVisit visit = fieldVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit not found"));

        if (!"PENDING".equals(visit.getStatus())) {
            throw new RuntimeException("Can only accept PENDING visits");
        }

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        visit.setOfficer(officer);
        visit.setStatus("SCHEDULED");
        visit.setOfficerMessage(actionDto.getOfficerMessage());
        visit.setScheduledDate(actionDto.getScheduledDate());

        FieldVisit savedVisit = fieldVisitRepository.save(visit);
        try {
            notificationService.createNotification(visit.getFarmer().getId().toString(), "Your field visit request in " + visit.getDistrict() + " has been scheduled for " + actionDto.getScheduledDate(), "INFO");
        } catch (Exception e) {}
        return mapToDto(savedVisit);
    }
    
    @Transactional
    public FieldVisitDto completeVisit(Long id, Long officerId, FieldVisitCompleteDto completeDto) {
        FieldVisit visit = fieldVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit not found"));

        if (!"SCHEDULED".equals(visit.getStatus())) {
            throw new RuntimeException("Can only complete SCHEDULED visits");
        }
        
        if (visit.getOfficer() == null || !visit.getOfficer().getId().equals(officerId)) {
            throw new RuntimeException("Only the assigned officer can complete this visit");
        }

        visit.setStatus("COMPLETED");
        visit.setCompletionNote(completeDto.getCompletionNote());
        visit.setCompletedDate(LocalDateTime.now());

        FieldVisit savedVisit = fieldVisitRepository.save(visit);
        try {
            notificationService.createNotification(visit.getFarmer().getId().toString(), "Your field visit in " + visit.getDistrict() + " is marked as COMPLETED by Officer.", "SUCCESS");
        } catch (Exception e) {}
        return mapToDto(savedVisit);
    }

    @Transactional
    public FieldVisitDto rejectVisit(Long id, Long officerId, FieldVisitActionDto actionDto) {
        FieldVisit visit = fieldVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit not found"));

        if (!"PENDING".equals(visit.getStatus())) {
            throw new RuntimeException("Can only reject PENDING visits");
        }

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        visit.setOfficer(officer);
        visit.setStatus("REJECTED");
        visit.setOfficerMessage(actionDto.getOfficerMessage());

        FieldVisit savedVisit = fieldVisitRepository.save(visit);
        try {
            notificationService.createNotification(visit.getFarmer().getId().toString(), "Your field visit request in " + visit.getDistrict() + " was Rejected.", "WARNING");
        } catch (Exception e) {}
        return mapToDto(savedVisit);
    }

    @Transactional
    public void deleteByOfficer(Long id, Long officerId) {
        FieldVisit visit = fieldVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit not found"));

        if (visit.getOfficer() == null || !visit.getOfficer().getId().equals(officerId)) {
            throw new RuntimeException("Only the assigned officer can hide this visit");
        }

        visit.setDeletedByOfficer(true);
        fieldVisitRepository.save(visit);
    }

    @Transactional
    public void deleteByFarmer(Long id, Long farmerId) {
        FieldVisit visit = fieldVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit not found"));

        if (!visit.getFarmer().getId().equals(farmerId)) {
            throw new RuntimeException("Only the requesting farmer can hide this visit");
        }

        visit.setDeletedByFarmer(true);
        fieldVisitRepository.save(visit);
    }

    private FieldVisitDto mapToDto(FieldVisit visit) {
        FieldVisitDto dto = new FieldVisitDto();
        dto.setId(visit.getId());
        dto.setFarmerId(visit.getFarmer().getId());
        
        // Farmer details
        profileRepository.findByUserId(visit.getFarmer().getId()).ifPresent(profile -> {
            dto.setFarmerName(profile.getFullName() != null ? profile.getFullName() : visit.getFarmer().getUsername());
            dto.setFarmerPhone(profile.getPhone());
        });

        // Officer details
        if (visit.getOfficer() != null) {
            dto.setOfficerId(visit.getOfficer().getId());
            profileRepository.findByUserId(visit.getOfficer().getId()).ifPresent(profile -> {
                dto.setOfficerName(profile.getFullName() != null ? profile.getFullName() : visit.getOfficer().getUsername());
                dto.setOfficerPhone(profile.getPhone());
            });
        }

        dto.setDistrict(visit.getDistrict());
        dto.setReason(visit.getReason());
        dto.setStatus(visit.getStatus());
        dto.setOfficerMessage(visit.getOfficerMessage());
        dto.setCompletionNote(visit.getCompletionNote());
        dto.setRequestedDate(visit.getRequestedDate());
        dto.setScheduledDate(visit.getScheduledDate());
        dto.setCompletedDate(visit.getCompletedDate());

        if (visit.getLand() != null) {
            dto.setLandId(visit.getLand().getId());
            dto.setLandName(visit.getLand().getLocationName());
            dto.setLatitude(visit.getLand().getLatitude());
            dto.setLongitude(visit.getLand().getLongitude());
        }

        return dto;
    }
}
