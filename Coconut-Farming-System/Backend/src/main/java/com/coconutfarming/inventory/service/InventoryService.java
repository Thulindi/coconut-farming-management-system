package com.coconutfarming.inventory.service;

import com.coconutfarming.inventory.model.*;
import com.coconutfarming.inventory.repository.*;
import com.coconutfarming.financial.entity.FinancialRecord;
import com.coconutfarming.financial.repository.FinancialRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private InventoryItemRepository itemRepo;
    @Autowired
    private SupplierRepository supplierRepo;
    @Autowired
    private PurchaseHistoryRepository purchaseRepo;
    @Autowired
    private usageTrackingRepository usageRepo;
    @Autowired
    private FinancialRecordRepository financialRecordRepository;
    @Autowired
    private com.coconutfarming.notification.service.NotificationService notificationService;

    // ===================================================
    // SUPPLIER CRUD
    // ===================================================

    public List<Supplier> getAllSuppliers(Long userId) {
        return supplierRepo.findByUserIdAndIsActiveTrue(userId);
    }

    public Optional<Supplier> getSupplierById(Integer id) {
        return supplierRepo.findById(id);
    }

    public Supplier saveSupplier(Long userId, Supplier supplier) {
        supplier.setUserId(userId);
        return supplierRepo.save(supplier);
    }

    public Supplier updateSupplier(Integer id, Supplier updated) {
        Supplier existing = supplierRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found: " + id));
        existing.setSupplierName(updated.getSupplierName());
        existing.setContactPerson(updated.getContactPerson());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setAddress(updated.getAddress());
        return supplierRepo.save(existing);
    }

    public void deleteSupplier(Integer id) {
        Supplier s = supplierRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found: " + id));
        s.setIsActive(false); // Soft delete
        supplierRepo.save(s);
    }

    // ===================================================
    // INVENTORY ITEM CRUD
    // ===================================================

    public List<InventoryItem> getAllItems(Long userId) {
        return populatePriceBreakdown(userId, itemRepo.findByUserIdAndIsActiveTrue(userId));
    }

    public List<InventoryItem> getItemsByCategory(Long userId, String category) {
        return populatePriceBreakdown(userId, itemRepo.findByUserIdAndCategoryAndIsActiveTrue(userId, category));
    }

    public List<InventoryItem> getLowStockItems(Long userId) {
        return populatePriceBreakdown(userId, itemRepo.findLowStockItemsByUserId(userId));
    }

    public List<InventoryItem> searchItems(Long userId, String name) {
        return populatePriceBreakdown(userId, itemRepo.findByUserIdAndItemNameContainingIgnoreCaseAndIsActiveTrue(userId, name));
    }

    public Optional<InventoryItem> getItemById(Integer id) {
        Optional<InventoryItem> opt = itemRepo.findById(id);
        opt.ifPresent(item -> populatePriceBreakdown(item.getUserId(), item));
        return opt;
    }

    public InventoryItem saveItem(Long userId, InventoryItem item) {
        item.setUserId(userId);
        return itemRepo.save(item);
    }

    @Transactional
    public InventoryItem updateItem(Integer id, InventoryItem updated) {
        InventoryItem existing = itemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found: " + id));
        existing.setItemName(updated.getItemName());
        existing.setCategory(updated.getCategory());
        existing.setUnit(updated.getUnit());
        existing.setUnitPrice(updated.getUnitPrice());
        existing.setQuantity(updated.getQuantity());
        existing.setMinStockLevel(updated.getMinStockLevel());
        existing.setFarmSection(updated.getFarmSection());
        existing.setDescription(updated.getDescription());
        if (updated.getSupplier() != null) {
            existing.setSupplier(updated.getSupplier());
        }
        return itemRepo.saveAndFlush(existing);
    }

    public void deleteItem(Integer id) {
        InventoryItem item = itemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found: " + id));
        item.setIsActive(false);
        itemRepo.save(item);
    }

    private List<InventoryItem> populatePriceBreakdown(Long userId, List<InventoryItem> items) {
        for (InventoryItem item : items) {
            populatePriceBreakdown(userId, item);
        }
        return items;
    }

    private InventoryItem populatePriceBreakdown(Long userId, InventoryItem item) {
        List<PurchaseHistory> purchases = purchaseRepo.findByUserIdAndItem_ItemIdOrderByPurchaseDateDesc(userId, item.getItemId());
        List<String> breakdown = new java.util.ArrayList<>();
        BigDecimal remainingQty = item.getQuantity() != null ? item.getQuantity() : BigDecimal.ZERO;

        for (PurchaseHistory p : purchases) {
            if (remainingQty.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal alloc = p.getQuantity().min(remainingQty);
            breakdown.add(alloc.stripTrailingZeros().toPlainString() + " " + item.getUnit() + " @ Rs " + p.getUnitPrice());
            remainingQty = remainingQty.subtract(alloc);
        }

        if (remainingQty.compareTo(BigDecimal.ZERO) > 0) {
            breakdown.add(remainingQty.stripTrailingZeros().toPlainString() + " " + item.getUnit() + " @ Rs " + item.getUnitPrice());
        }

        item.setPriceBreakdown(breakdown);
        return item;
    }

    // ===================================================
    // PURCHASE - adds stock
    // ===================================================

    @Transactional
    public PurchaseHistory recordPurchase(Long userId, Integer itemId, Integer supplierId,
            BigDecimal quantity, BigDecimal unitPrice,
            LocalDate purchaseDate, String notes) {
        InventoryItem item = itemRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

        Supplier supplier = supplierId != null
                ? supplierRepo.findById(supplierId).orElse(null)
                : null;

        // Calculate Weighted Average Cost
        BigDecimal existingQuantity = item.getQuantity() != null ? item.getQuantity() : BigDecimal.ZERO;
        BigDecimal existingPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;

        BigDecimal existingTotalValue = existingQuantity.multiply(existingPrice);
        BigDecimal newPurchaseValue = quantity.multiply(unitPrice);
        BigDecimal newTotalValue = existingTotalValue.add(newPurchaseValue);

        BigDecimal newTotalQuantity = existingQuantity.add(quantity);

        BigDecimal newUnitPrice = BigDecimal.ZERO;
        if (newTotalQuantity.compareTo(BigDecimal.ZERO) > 0) {
            newUnitPrice = newTotalValue.divide(newTotalQuantity, 4, java.math.RoundingMode.HALF_UP);
        }

        // Update stock
        item.setQuantity(newTotalQuantity);
        item.setUnitPrice(newUnitPrice);
        itemRepo.save(item);

        // Record purchase
        PurchaseHistory purchase = PurchaseHistory.builder()
                .item(item)
                .supplier(supplier)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .purchaseDate(purchaseDate != null ? purchaseDate : LocalDate.now())
                .notes(notes)
                .userId(userId)
                .build();

        // Record expense in Financial Dashboard
        FinancialRecord expense = new FinancialRecord();
        expense.setUserId(userId);
        expense.setRecordType(FinancialRecord.RecordType.EXPENSE);
        expense.setCategory("Inventory Purchase");
        expense.setAmount(quantity.multiply(unitPrice));
        
        String supplierInfo = supplier != null ? " from " + supplier.getSupplierName() : "";
        expense.setDescription("Purchased " + quantity + " " + item.getUnit() + " of " + item.getItemName() + supplierInfo);
        expense.setRecordDate(purchaseDate != null ? purchaseDate : LocalDate.now());
        
        financialRecordRepository.save(expense);

        return purchaseRepo.save(purchase);
    }

    public List<PurchaseHistory> getPurchaseHistory(Long userId) {
        return purchaseRepo.findAllByUserIdOrderByDateDesc(userId);
    }

    public List<PurchaseHistory> getPurchaseHistoryByItem(Long userId, Integer itemId) {
        return purchaseRepo.findByUserIdAndItem_ItemIdOrderByPurchaseDateDesc(userId, itemId);
    }

    // ===================================================
    // USAGE - deducts stock
    // ===================================================

    @Transactional
    public UsageTracking recordUsage(Long userId, Integer itemId, BigDecimal quantityUsed,
            String farmSection, String usedBy,
            LocalDate usageDate, String purpose) {
        InventoryItem item = itemRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

        if (item.getQuantity().compareTo(quantityUsed) < 0) {
            throw new RuntimeException("Insufficient stock. Available: " + item.getQuantity() + " " + item.getUnit());
        }

        // Deduct stock
        item.setQuantity(item.getQuantity().subtract(quantityUsed));
        itemRepo.save(item);

        if (item.getMinStockLevel() != null && item.getQuantity().compareTo(item.getMinStockLevel()) <= 0) {
            try {
                notificationService.createNotification(userId.toString(), "Low stock alert: " + item.getItemName() + " has reached minimum level.", "WARNING");
            } catch (Exception e) {}
        }

        // Record usage
        UsageTracking usage = UsageTracking.builder()
                .item(item)
                .quantityUsed(quantityUsed)
                .farmSection(farmSection)
                .usedBy(usedBy)
                .usageDate(usageDate != null ? usageDate : LocalDate.now())
                .purpose(purpose)
                .userId(userId)
                .build();

        return usageRepo.save(usage);
    }

    public List<UsageTracking> getAllUsage(Long userId) {
        return usageRepo.findAllByUserIdOrderByDateDesc(userId);
    }

    public List<UsageTracking> getUsageByItem(Long userId, Integer itemId) {
        return usageRepo.findByUserIdAndItem_ItemIdOrderByUsageDateDesc(userId, itemId);
    }

    public List<UsageTracking> getUsageByFarmSection(Long userId, String section) {
        return usageRepo.findByUserIdAndFarmSectionOrderByUsageDateDesc(userId, section);
    }
}
