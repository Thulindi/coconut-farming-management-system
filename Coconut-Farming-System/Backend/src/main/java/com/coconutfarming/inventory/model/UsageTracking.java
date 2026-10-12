package com.coconutfarming.inventory.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "usage_tracking")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usage_id")
    private Integer usageId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InventoryItem item;

    @DecimalMin(value = "0.01", message = "Quantity used must be greater than 0")
    @Column(name = "quantity_used", nullable = false)
    private BigDecimal quantityUsed;

    @Column(name = "farm_section", length = 100)
    private String farmSection;

    @Column(name = "used_by", length = 100)
    private String usedBy;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @Column(name = "purpose", length = 300)
    private String purpose;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (usageDate == null) usageDate = LocalDate.now();
    }
}
