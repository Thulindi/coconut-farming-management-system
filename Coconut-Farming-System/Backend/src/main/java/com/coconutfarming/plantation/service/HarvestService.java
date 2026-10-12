package com.coconutfarming.plantation.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.coconutfarming.plantation.dto.HarvestAnalyticsResponse;
import com.coconutfarming.plantation.dto.HarvestRequest;
import com.coconutfarming.plantation.exception.ResourceNotFoundException;
import com.coconutfarming.plantation.model.HarvestRecord;
import com.coconutfarming.plantation.model.Land;
import com.coconutfarming.plantation.repository.HarvestRecordRepository;
import com.coconutfarming.plantation.repository.LandRepository;
import com.coconutfarming.financial.entity.FinancialRecord;
import com.coconutfarming.financial.service.FinancialService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HarvestService {
    private final HarvestRecordRepository harvestRepository;
    private final LandRepository landRepository;
    private final FinancialService financialService;

    public HarvestService(HarvestRecordRepository harvestRepository, 
                         LandRepository landRepository,
                         FinancialService financialService) {
        this.harvestRepository = harvestRepository;
        this.landRepository = landRepository;
        this.financialService = financialService;
    }

    public Page<HarvestRecord> search(Long farmerId, Long landId, LocalDate start, LocalDate end, String season, Pageable pageable) {
        Land land = getLand(landId, farmerId);
        return harvestRepository.search(land, farmerId, start, end, season, pageable);
    }

    public HarvestRecord getById(Long id, Long farmerId) {
        return harvestRepository.findByIdAndFarmerId(id, farmerId)
            .orElseThrow(() -> new ResourceNotFoundException("Harvest record not found"));
    }

    @Transactional
    public HarvestRecord create(Long farmerId, Long landId, HarvestRequest request) {
        Land land = getLand(landId, farmerId);
        HarvestRecord record = new HarvestRecord();
        record.setLand(land);
        record.setFarmerId(farmerId);
        applyRequest(record, request);
        
        // Handle financial integration
        if (record.getIncome() != null && record.getIncome().compareTo(BigDecimal.ZERO) > 0) {
            FinancialRecord finRecord = createFinancialRecord(record);
            FinancialRecord savedFin = financialService.createRecord(farmerId, finRecord);
            record.setFinancialRecordId(savedFin.getId());
        }
        
        return harvestRepository.save(record);
    }

    @Transactional
    public HarvestRecord update(Long farmerId, Long harvestId, HarvestRequest request) {
        HarvestRecord record = getById(harvestId, farmerId);
        applyRequest(record, request);
        
        // Handle financial integration updates
        if (record.getIncome() != null && record.getIncome().compareTo(BigDecimal.ZERO) > 0) {
            if (record.getFinancialRecordId() != null) {
                // Update existing
                FinancialRecord finRecord = financialService.getRecordById(farmerId, record.getFinancialRecordId());
                updateFinancialRecord(finRecord, record);
                financialService.updateRecord(farmerId, finRecord.getId(), finRecord);
            } else {
                // Create new
                FinancialRecord finRecord = createFinancialRecord(record);
                FinancialRecord savedFin = financialService.createRecord(farmerId, finRecord);
                record.setFinancialRecordId(savedFin.getId());
            }
        } else if (record.getFinancialRecordId() != null) {
            // Income removed, delete financial record
            financialService.deleteRecord(farmerId, record.getFinancialRecordId());
            record.setFinancialRecordId(null);
        }
        
        return harvestRepository.save(record);
    }

    @Transactional
    public void delete(Long farmerId, Long harvestId) {
        HarvestRecord record = getById(harvestId, farmerId);
        if (record.getFinancialRecordId() != null) {
            financialService.deleteRecord(farmerId, record.getFinancialRecordId());
        }
        harvestRepository.delete(record);
    }

    private FinancialRecord createFinancialRecord(HarvestRecord record) {
        FinancialRecord finRecord = new FinancialRecord();
        finRecord.setUserId(record.getFarmerId());
        finRecord.setRecordType(FinancialRecord.RecordType.INCOME);
        finRecord.setCategory("Harvest Income");
        updateFinancialRecord(finRecord, record);
        return finRecord;
    }

    private void updateFinancialRecord(FinancialRecord finRecord, HarvestRecord harvestRecord) {
        finRecord.setAmount(harvestRecord.getIncome());
        finRecord.setRecordDate(harvestRecord.getHarvestDate());
        finRecord.setDescription(String.format("Harvest from %s (%s) - %d coconuts", 
            harvestRecord.getLand().getLocationName(), 
            harvestRecord.getSeason(),
            harvestRecord.getTotalCoconuts()));
    }

    public HarvestAnalyticsResponse analytics(Long farmerId, Long landId) {
        Land land = getLand(landId, farmerId);
        List<HarvestRecord> records = harvestRepository.findByLand(land);

        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Integer> byMonthMap = records.stream()
            .collect(Collectors.groupingBy(r -> r.getHarvestDate().format(monthFmt), Collectors.summingInt(HarvestRecord::getTotalCoconuts)));

        List<HarvestAnalyticsResponse.MonthBucket> byMonth = byMonthMap.entrySet().stream()
            .map(e -> new HarvestAnalyticsResponse.MonthBucket(e.getKey(), e.getValue()))
            .sorted(Comparator.comparing(HarvestAnalyticsResponse.MonthBucket::getMonth))
            .collect(Collectors.toList());

        Map<String, Integer> bySeasonMap = records.stream()
            .collect(Collectors.groupingBy(HarvestRecord::getSeason, Collectors.summingInt(HarvestRecord::getTotalCoconuts)));

        List<HarvestAnalyticsResponse.SeasonBucket> bySeason = bySeasonMap.entrySet().stream()
            .map(e -> new HarvestAnalyticsResponse.SeasonBucket(e.getKey(), e.getValue()))
            .sorted(Comparator.comparing(HarvestAnalyticsResponse.SeasonBucket::getSeason))
            .collect(Collectors.toList());

        int totalCoconuts = records.stream().mapToInt(HarvestRecord::getTotalCoconuts).sum();
        BigDecimal yieldPerAcre = BigDecimal.ZERO;
        if (land.getAreaInAcres() != null && land.getAreaInAcres().compareTo(BigDecimal.ZERO) > 0) {
            yieldPerAcre = BigDecimal.valueOf(totalCoconuts)
                .divide(land.getAreaInAcres(), 2, RoundingMode.HALF_UP);
        }

        HarvestAnalyticsResponse.YieldPerAcre yield = new HarvestAnalyticsResponse.YieldPerAcre(
            land.getAreaInAcres(), totalCoconuts, yieldPerAcre);

        return new HarvestAnalyticsResponse(byMonth, bySeason, yield);
    }

    private void applyRequest(HarvestRecord record, HarvestRequest request) {
        record.setHarvestDate(request.getHarvestDate());
        record.setSeason(request.getSeason());
        record.setTotalCoconuts(request.getTotalCoconuts());
        record.setIncome(request.getIncome());
        record.setNotes(request.getNotes());
    }

    private Land getLand(Long id, Long farmerId) {
        return landRepository.findByIdAndFarmerId(id, farmerId)
            .orElseThrow(() -> new ResourceNotFoundException("Land not found"));
    }
}
