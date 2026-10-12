package com.coconutfarming.inventory.repository;

import com.coconutfarming.inventory.model.PurchaseHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PurchaseHistoryRepository extends JpaRepository<PurchaseHistory, Integer> {

    List<PurchaseHistory> findByUserIdAndItem_ItemIdOrderByPurchaseDateDesc(Long userId, Integer itemId);

    @Query("SELECT p FROM PurchaseHistory p WHERE p.userId = :userId ORDER BY p.purchaseDate DESC")
    List<PurchaseHistory> findAllByUserIdOrderByDateDesc(@Param("userId") Long userId);
}
