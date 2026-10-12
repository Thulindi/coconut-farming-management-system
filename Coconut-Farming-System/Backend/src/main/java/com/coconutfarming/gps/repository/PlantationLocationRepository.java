package com.coconutfarming.gps.repository;

import com.coconutfarming.gps.model.PlantationLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlantationLocationRepository extends JpaRepository<PlantationLocation, Long> {
    List<PlantationLocation> findAllByOrderByCreatedAtDesc();
}
