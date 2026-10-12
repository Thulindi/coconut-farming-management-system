package com.coconutfarming.user.repository;

import com.coconutfarming.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository("mainUserRepository")
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Optional<User> findByEmailVerificationToken(String token);
    
    long countByRolesName(String name);
    long countByRolesNameAndStatus(String roleName, String status);
    java.util.List<User> findTop2ByOrderByIdDesc();
}
