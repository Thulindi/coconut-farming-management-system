package com.coconutfarming.financial.service;

import com.coconutfarming.financial.entity.FinancialRecord;
import com.coconutfarming.financial.repository.FinancialRecordRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinancialService {

    private final FinancialRecordRepository repository;

    public FinancialService(FinancialRecordRepository repository) {
        this.repository = repository;
    }

    public List<FinancialRecord> getAllRecords(Long userId) {
        return repository.findAllByUserIdOrderByRecordDateDesc(userId);
    }

    public FinancialRecord getRecordById(Long userId, Long id) {
        return repository.findByIdAndUserId(id, userId).orElseThrow(() -> new RuntimeException("Record not found"));
    }

    public FinancialRecord createRecord(Long userId, FinancialRecord record) {
        record.setUserId(userId);
        return repository.save(record);
    }

    public FinancialRecord updateRecord(Long userId, Long id, FinancialRecord record) {
        FinancialRecord existing = getRecordById(userId, id);
        existing.setRecordType(record.getRecordType());
        existing.setCategory(record.getCategory());
        existing.setAmount(record.getAmount());
        existing.setDescription(record.getDescription());
        existing.setRecordDate(record.getRecordDate());
        return repository.save(existing);
    }

    public void deleteRecord(Long userId, Long id) {
        FinancialRecord existing = getRecordById(userId, id);
        repository.delete(existing);
    }

    public Map<String, Object> getDashboardSummary(Long userId) {
        List<FinancialRecord> allRecords = repository.findAllByUserIdOrderByRecordDateDesc(userId);
        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();

        BigDecimal totalIncome = allRecords.stream()
                .filter(r -> r.getRecordType() == FinancialRecord.RecordType.INCOME)
                .map(FinancialRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = allRecords.stream()
                .filter(r -> r.getRecordType() == FinancialRecord.RecordType.EXPENSE)
                .map(FinancialRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthlyIncome = allRecords.stream()
                .filter(r -> r.getRecordType() == FinancialRecord.RecordType.INCOME)
                .filter(r -> !r.getRecordDate().isBefore(monthStart) && !r.getRecordDate().isAfter(monthEnd))
                .map(FinancialRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthlyExpense = allRecords.stream()
                .filter(r -> r.getRecordType() == FinancialRecord.RecordType.EXPENSE)
                .filter(r -> !r.getRecordDate().isBefore(monthStart) && !r.getRecordDate().isAfter(monthEnd))
                .map(FinancialRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("totalProfit", totalIncome.subtract(totalExpense));
        summary.put("monthlyIncome", monthlyIncome);
        summary.put("monthlyExpense", monthlyExpense);
        summary.put("monthlyProfit", monthlyIncome.subtract(monthlyExpense));
        summary.put("recordCount", allRecords.size());

        return summary;
    }

    public List<Map<String, Object>> getMonthlyComparison(Long userId, int months) {
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        YearMonth current = YearMonth.now();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            LocalDate start = month.atDay(1);
            LocalDate end = month.atEndOfMonth();
            List<FinancialRecord> monthRecords = repository.findByUserIdAndRecordDateBetweenOrderByRecordDateDesc(userId, start, end);

            BigDecimal income = monthRecords.stream()
                    .filter(r -> r.getRecordType() == FinancialRecord.RecordType.INCOME)
                    .map(FinancialRecord::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal expense = monthRecords.stream()
                    .filter(r -> r.getRecordType() == FinancialRecord.RecordType.EXPENSE)
                    .map(FinancialRecord::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month.toString());
            monthData.put("income", income);
            monthData.put("expense", expense);
            monthData.put("profit", income.subtract(expense));
            result.add(monthData);
        }

        return result;
    }

    public List<Map<String, Object>> getCategoryBreakdown(Long userId) {
        List<FinancialRecord> allRecords = repository.findAllByUserIdOrderByRecordDateDesc(userId);
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();

        for (FinancialRecord r : allRecords) {
            String cat = r.getCategory();
            if (r.getRecordType() == FinancialRecord.RecordType.INCOME) {
                incomeByCategory.merge(cat, r.getAmount(), BigDecimal::add);
            } else {
                expenseByCategory.merge(cat, r.getAmount(), BigDecimal::add);
            }
        }

        List<Map<String, Object>> result = new java.util.ArrayList<>();
        incomeByCategory.forEach((cat, amt) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("category", cat);
            m.put("type", "INCOME");
            m.put("amount", amt);
            result.add(m);
        });
        expenseByCategory.forEach((cat, amt) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("category", cat);
            m.put("type", "EXPENSE");
            m.put("amount", amt);
            result.add(m);
        });

        return result;
    }
}
