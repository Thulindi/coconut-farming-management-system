package com.coconutfarming.visit.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FieldVisitRequestDto {
    private String district;
    private String reason;
    private Long landId;
}
