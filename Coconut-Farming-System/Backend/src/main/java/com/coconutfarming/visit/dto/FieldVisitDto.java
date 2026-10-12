package com.coconutfarming.visit.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FieldVisitDto {
    private Long id;
    private Long farmerId;
    private String farmerName;
    private String farmerPhone;
    
    private Long officerId;
    private String officerName;
    private String officerPhone;
    
    private String district;
    private String reason;
    private String status;
    private String officerMessage;
    private String completionNote;
    
    private Long landId;
    private String landName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    private LocalDateTime requestedDate;
    private LocalDateTime scheduledDate;
    private LocalDateTime completedDate;
}
