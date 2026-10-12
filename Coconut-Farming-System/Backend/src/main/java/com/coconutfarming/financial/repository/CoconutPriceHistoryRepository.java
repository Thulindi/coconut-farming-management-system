package com.coconutfarming.financial.repository;

import com.coconutfarming.financial.entity.CoconutPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoconutPriceHistoryRepository extends JpaRepository<CoconutPriceHistory, Long> {
    List<CoconutPriceHistory> findAllByOrderByRecordDateAsc();
}
