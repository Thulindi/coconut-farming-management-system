package com.coconutfarming.visit.repository;

import com.coconutfarming.visit.model.FieldVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FieldVisitRepository extends JpaRepository<FieldVisit, Long> {

    List<FieldVisit> findByFarmerIdAndIsDeletedByFarmerFalseOrderByRequestedDateDesc(Long farmerId);

    List<FieldVisit> findByDistrictAndStatusOrderByRequestedDateDesc(String district, String status);

    List<FieldVisit> findByOfficerIdAndIsDeletedByOfficerFalseOrderByRequestedDateDesc(Long officerId);

    List<FieldVisit> findByOfficerIdAndStatusOrderByRequestedDateDesc(Long officerId, String status);

}
