package com.coconutfarming.inventory.repository;

import com.coconutfarming.inventory.model.UsageTracking;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface usageTrackingRepository extends JpaRepository<UsageTracking, Integer> {

    @EntityGraph(attributePaths = {"item.supplier"})
    List<UsageTracking> findByUserIdAndItem_ItemIdOrderByUsageDateDesc(Long userId, Integer itemId);

    @EntityGraph(attributePaths = {"item.supplier"})
    List<UsageTracking> findByUserIdAndFarmSectionOrderByUsageDateDesc(Long userId, String farmSection);

    @Query("SELECT u FROM UsageTracking u WHERE u.userId = :userId ORDER BY u.usageDate DESC")
    @EntityGraph(attributePaths = {"item.supplier"})
    List<UsageTracking> findAllByUserIdOrderByDateDesc(Long userId);
}
