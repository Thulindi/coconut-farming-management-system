package com.coconutfarming.financial.repository;

import com.coconutfarming.financial.entity.FinancialRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, Long> {

    List<FinancialRecord> findAllByUserIdOrderByRecordDateDesc(Long userId);

    List<FinancialRecord> findByUserIdAndRecordDateBetweenOrderByRecordDateDesc(Long userId, LocalDate start, LocalDate end);

    List<FinancialRecord> findByUserIdAndRecordTypeOrderByRecordDateDesc(Long userId, FinancialRecord.RecordType recordType);

    java.util.Optional<FinancialRecord> findByIdAndUserId(Long id, Long userId);
}
