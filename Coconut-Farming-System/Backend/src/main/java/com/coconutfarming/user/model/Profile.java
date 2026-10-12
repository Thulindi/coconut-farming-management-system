package com.coconutfarming.user.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    private String fullName;

    @Column(columnDefinition = "LONGTEXT")
    private String profilePhoto;

    private String district;
    private String phone;
    private String department;
    private String designation;
}
