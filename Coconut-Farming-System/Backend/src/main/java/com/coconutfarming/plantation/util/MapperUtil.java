package com.coconutfarming.plantation.util;

import com.coconutfarming.plantation.dto.*;
import com.coconutfarming.plantation.model.*;

public final class MapperUtil {
    private MapperUtil() {}

    public static LandResponse toLandResponse(Land land) {
        LandResponse res = new LandResponse();
        res.setId(land.getId());
        res.setFarmerId(land.getFarmerId());
        res.setLocationName(land.getLocationName());
        res.setDistrict(land.getDistrict());
        res.setAreaInAcres(land.getAreaInAcres());
        res.setNumberOfTrees(land.getNumberOfTrees());
        res.setCoconutVariety(land.getCoconutVariety());
        res.setSoilType(land.getSoilType());
        res.setIrrigationType(land.getIrrigationType());
        res.setNotes(land.getNotes());
        res.setStatus(land.getStatus());
        res.setCreatedAt(land.getCreatedAt());
        res.setUpdatedAt(land.getUpdatedAt());
        res.setLatitude(land.getLatitude());
        res.setLongitude(land.getLongitude());
        return res;
    }

    public static FertilizerScheduleResponse toScheduleResponse(FertilizerSchedule schedule, java.time.LocalDate lastAppliedDate) {
        FertilizerScheduleResponse res = new FertilizerScheduleResponse();
        res.setId(schedule.getId());
        res.setLandId(schedule.getLand().getId());
        res.setFertilizerType(schedule.getFertilizerType());
        res.setFrequency(schedule.getFrequency());
        res.setRecommendedQuantity(schedule.getRecommendedQuantity());
        res.setNextDueDate(schedule.getNextDueDate());
        res.setApplicationMethod(schedule.getApplicationMethod());
        res.setNotes(schedule.getNotes());
        res.setStatus(schedule.getStatus());
        res.setLastAppliedDate(lastAppliedDate);
        res.setCreatedAt(schedule.getCreatedAt());
        res.setUpdatedAt(schedule.getUpdatedAt());
        return res;
    }

    public static FertilizerApplicationResponse toApplicationResponse(FertilizerApplication app) {
        FertilizerApplicationResponse res = new FertilizerApplicationResponse();
        res.setId(app.getId());
        res.setScheduleId(app.getSchedule().getId());
        res.setAppliedDate(app.getAppliedDate());
        res.setFertilizerType(app.getFertilizerType());
        res.setQuantityUsed(app.getQuantityUsed());
        res.setRemarks(app.getRemarks());
        res.setCreatedAt(app.getCreatedAt());
        return res;
    }

    public static HarvestResponse toHarvestResponse(HarvestRecord record) {
        HarvestResponse res = new HarvestResponse();
        res.setId(record.getId());
        res.setLandId(record.getLand().getId());
        res.setHarvestDate(record.getHarvestDate());
        res.setSeason(record.getSeason());
        res.setTotalCoconuts(record.getTotalCoconuts());
        res.setIncome(record.getIncome());
        res.setNotes(record.getNotes());
        res.setCreatedAt(record.getCreatedAt());
        res.setUpdatedAt(record.getUpdatedAt());
        return res;
    }

    public static FertilizerScheduleResponse toFertilizerScheduleResponse(FertilizerSchedule schedule) {
        return toScheduleResponse(schedule, null);
    }
}
