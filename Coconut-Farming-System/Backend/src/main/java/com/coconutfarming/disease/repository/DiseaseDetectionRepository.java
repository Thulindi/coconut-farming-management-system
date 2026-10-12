package com.coconutfarming.disease.repository;

import com.coconutfarming.disease.model.DiseaseDetectionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseaseDetectionRepository extends JpaRepository<DiseaseDetectionHistory, Long> {
    List<DiseaseDetectionHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
