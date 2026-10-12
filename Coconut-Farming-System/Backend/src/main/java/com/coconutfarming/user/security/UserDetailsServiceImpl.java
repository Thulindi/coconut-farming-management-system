package com.coconutfarming.user.security;

import com.coconutfarming.user.model.User;
import com.coconutfarming.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Account not found with email: " + email));

        boolean isFarmer = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("FARMER"));

        if ("REJECTED".equals(user.getStatus())) {
            throw new RuntimeException("Your account has been suspended or banned. Please contact the administrator.");
        }

        if (isFarmer) {
            // Farmers must verify email first
            if (!"EMAIL_VERIFIED".equals(user.getStatus()) && !"APPROVED".equals(user.getStatus()) && !"ACTIVE".equals(user.getStatus())) {
                throw new RuntimeException("Please verify your email address before logging in. Check your inbox for the verification link.");
            }
        } else {
            // Officers and Admins must be approved by admin
            if (!"APPROVED".equals(user.getStatus()) && !"ACTIVE".equals(user.getStatus())) {
                throw new RuntimeException("Your account is pending Admin approval. Please wait for an administrator to review your registration.");
            }
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.getName()))
                        .collect(Collectors.toList()));
    }
}
