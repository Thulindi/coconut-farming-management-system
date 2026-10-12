package com.coconutfarming.inventory.repository;

import com.coconutfarming.inventory.model.InventoryItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Integer> {

    @EntityGraph(attributePaths = { "supplier" })
    List<InventoryItem> findByUserIdAndIsActiveTrue(Long userId);

    @EntityGraph(attributePaths = { "supplier" })
    List<InventoryItem> findByUserIdAndCategoryAndIsActiveTrue(Long userId, String category);

    @Query("SELECT i FROM InventoryItem i WHERE i.userId = :userId AND i.quantity <= i.minStockLevel AND i.isActive = true")
    @EntityGraph(attributePaths = { "supplier" })
    List<InventoryItem> findLowStockItemsByUserId(Long userId);

    @EntityGraph(attributePaths = { "supplier" })
    List<InventoryItem> findByUserIdAndItemNameContainingIgnoreCaseAndIsActiveTrue(Long userId, String name);

    @EntityGraph(attributePaths = { "supplier" })
    List<InventoryItem> findByUserIdAndFarmSectionAndIsActiveTrue(Long userId, String farmSection);
}
