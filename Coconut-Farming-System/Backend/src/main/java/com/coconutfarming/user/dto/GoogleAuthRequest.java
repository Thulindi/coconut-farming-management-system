package com.coconutfarming.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleAuthRequest {
    private String tokenId;
    private String role; // FARMER or OFFICER (only used for new registrations)
    private String officerId; // Only used for OFFICER registrations
}
