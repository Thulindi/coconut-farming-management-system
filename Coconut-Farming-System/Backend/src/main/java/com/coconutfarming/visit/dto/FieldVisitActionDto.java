package com.coconutfarming.visit.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class FieldVisitActionDto {
    private String officerMessage;
    private LocalDateTime scheduledDate;
}
