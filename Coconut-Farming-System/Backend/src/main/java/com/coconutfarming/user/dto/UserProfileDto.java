package com.coconutfarming.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private String status;
    private String officerId;
    private String fullName;
    private String profilePhoto;
    private String district;
    private String phone;
    private String department;
    private String designation;
    private Set<String> roles;
}
