package com.coconutfarming.inventory.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "inventory_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Integer itemId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank(message = "Item name is required")
    @Column(name = "item_name", nullable = false, length = 150)
    private String itemName;

    @NotBlank(message = "Category is required")
    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @DecimalMin(value = "0.0")
    @Column(name = "quantity", nullable = false)
    private BigDecimal quantity = BigDecimal.ZERO;

    @NotBlank(message = "Unit is required")
    @Column(name = "unit", nullable = false, length = 30)
    private String unit;

    @Column(name = "unit_price")
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @DecimalMin(value = "0.0")
    @Column(name = "min_stock_level", nullable = false)
    private BigDecimal minStockLevel = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    @JsonIgnore
    private Supplier supplier;

    @Column(name = "farm_section", length = 100)
    private String farmSection;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Transient
    private List<String> priceBreakdown;

    @Transient
    public boolean isLowStock() {
        return quantity.compareTo(minStockLevel) <= 0;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
