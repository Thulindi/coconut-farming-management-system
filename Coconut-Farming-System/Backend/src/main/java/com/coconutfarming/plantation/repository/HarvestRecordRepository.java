package com.coconutfarming.plantation.repository;

import java.time.LocalDate;
import java.util.List;

import com.coconutfarming.plantation.model.HarvestRecord;
import com.coconutfarming.plantation.model.Land;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HarvestRecordRepository extends JpaRepository<HarvestRecord, Long> {
    @Query("select h from HarvestRecord h where h.land = :land " +
           "and h.farmerId = :farmerId " +
           "and (:start is null or h.harvestDate >= :start) " +
           "and (:end is null or h.harvestDate <= :end) " +
           "and (:season is null or h.season = :season)")
    Page<HarvestRecord> search(@Param("land") Land land,
                               @Param("farmerId") Long farmerId,
                               @Param("start") LocalDate start,
                               @Param("end") LocalDate end,
                               @Param("season") String season,
                               Pageable pageable);

    java.util.Optional<HarvestRecord> findByIdAndFarmerId(Long id, Long farmerId);

    List<HarvestRecord> findByLand(Land land);
}
