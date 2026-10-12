package com.coconutfarming.plantation.service;

import com.coconutfarming.plantation.dto.LandRequest;
import com.coconutfarming.plantation.exception.ResourceNotFoundException;
import com.coconutfarming.plantation.model.Land;
import com.coconutfarming.plantation.model.LandStatus;
import com.coconutfarming.plantation.repository.LandRepository;
import com.coconutfarming.user.model.Profile;
import com.coconutfarming.user.repository.ProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.coconutfarming.notification.service.NotificationService;

@Service
public class LandService {
    private final LandRepository landRepository;
    private final ProfileRepository profileRepository;
    private final NotificationService notificationService;

    public LandService(LandRepository landRepository, ProfileRepository profileRepository, NotificationService notificationService) {
        this.landRepository = landRepository;
        this.profileRepository = profileRepository;
        this.notificationService = notificationService;
    }

    public Page<Land> search(Long farmerId, LandStatus status, String search, Pageable pageable) {
        return landRepository.search(farmerId, status, search, pageable);
    }

    public Page<Land> getAllAdmin(String district, Pageable pageable) {
        if (district != null && !district.isEmpty()) {
            return landRepository.findByDistrictContainingIgnoreCaseAndDeletedFalse(district, pageable);
        }
        return landRepository.findByDeletedFalse(pageable);
    }

    public Page<Land> getAllOfficer(Long userId, Pageable pageable) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer profile not found"));
        
        String district = profile.getDistrict();
        if (district == null || district.isEmpty()) {
            throw new ResourceNotFoundException("Officer district not assigned");
        }

        return landRepository.findByDistrictContainingIgnoreCaseAndDeletedFalse(district, pageable);
    }

    public Land getById(Long id, Long farmerId) {
        return landRepository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Land not found"));
    }

    @Transactional
    public Land create(Long farmerId, LandRequest request) {
        Land land = new Land();
        land.setFarmerId(farmerId);
        applyRequest(land, request);
        Land savedLand = landRepository.save(land);
        try {
            notificationService.notifyAdmins("Farmer with ID " + farmerId + " added a new land at " + request.getLocationName(), "INFO");
        } catch (Exception e) {
            // Ignore notification failure
        }
        return savedLand;
    }

    @Transactional
    public Land update(Long farmerId, Long id, LandRequest request) {
        Land land = getById(id, farmerId);
        applyRequest(land, request);
        return landRepository.save(land);
    }

    @Transactional
    public void deleteLand(Long farmerId, Long id) {
        Land land = getById(id, farmerId);
        landRepository.delete(land);
    }

    private void applyRequest(Land land, LandRequest request) {
        // farmerId is set separately to ensure isolation
        land.setLocationName(request.getLocationName());
        land.setDistrict(request.getDistrict());
        land.setAreaInAcres(request.getAreaInAcres());
        land.setNumberOfTrees(request.getNumberOfTrees());
        land.setCoconutVariety(request.getCoconutVariety());
        land.setSoilType(request.getSoilType());
        land.setIrrigationType(request.getIrrigationType());
        land.setNotes(request.getNotes());
        land.setStatus(request.getStatus());
        land.setLatitude(request.getLatitude());
        land.setLongitude(request.getLongitude());
    }
}
