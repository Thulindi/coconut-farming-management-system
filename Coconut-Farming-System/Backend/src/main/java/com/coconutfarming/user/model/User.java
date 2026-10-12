package com.coconutfarming.user.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity(name = "MainUser")
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    private String status;

    @Column(name = "officer_id")
    private String officerId;

    // For farmer email verification
    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @Column(name = "email_verified")
    private boolean emailVerified = false;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Profile profile;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles;

    private java.time.Instant createdAt;
    private java.time.Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = java.time.Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = java.time.Instant.now();
    }

    public java.time.Instant getCreatedAt() {
        return createdAt;
    }
}
