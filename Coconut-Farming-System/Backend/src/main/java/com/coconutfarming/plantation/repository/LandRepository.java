package com.coconutfarming.plantation.repository;

import com.coconutfarming.plantation.model.Land;
import com.coconutfarming.plantation.model.LandStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LandRepository extends JpaRepository<Land, Long> {
    @Query("select l from Land l where (:farmerId is null or l.farmerId = :farmerId) " +
           "and (:status is null or l.status = :status) " +
           "and (:search is null or lower(l.locationName) like lower(concat('%', :search, '%')) " +
           "or lower(l.district) like lower(concat('%', :search, '%'))) ")
    Page<Land> search(@Param("farmerId") Long farmerId,
                      @Param("status") LandStatus status,
                      @Param("search") String search,
                      Pageable pageable);

    java.util.Optional<Land> findByIdAndFarmerId(Long id, Long farmerId);
    Page<Land> findByFarmerId(Long farmerId, Pageable pageable);
    void deleteByFarmerId(Long farmerId);
    Page<Land> findByDistrictContainingIgnoreCaseAndDeletedFalse(String district, Pageable pageable);
    Page<Land> findByDeletedFalse(Pageable pageable);
}
