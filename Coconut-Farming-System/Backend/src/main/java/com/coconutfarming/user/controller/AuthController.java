package com.coconutfarming.user.controller;

import com.coconutfarming.user.dto.LoginRequest;
import com.coconutfarming.user.dto.RegisterRequest;
import com.coconutfarming.user.dto.GoogleAuthRequest;
import com.coconutfarming.user.dto.ResetPasswordRequest;
import com.coconutfarming.user.model.User;
import com.coconutfarming.user.repository.UserRepository;
import com.coconutfarming.user.security.JwtUtils;
import com.coconutfarming.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    //Register
    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }

    // Email verification endpoint
    @GetMapping("/verify-email")
    public RedirectView verifyEmail(@RequestParam String token) {
        try {
            User user = userRepository.findByEmailVerificationToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid or expired verification token."));

            if ("EMAIL_VERIFIED".equals(user.getStatus())) {
                return new RedirectView(frontendUrl + "/login?verified=already");
            }

            user.setStatus("EMAIL_VERIFIED");
            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            userRepository.save(user);

            return new RedirectView(frontendUrl + "/login?verified=success");
        } catch (Exception e) {
            return new RedirectView(frontendUrl + "/login?verified=error");
        }
    }

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    //Login
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(loginRequest.getEmail());

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        User user = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("id", user.getId());
        response.put("username", userDetails.getUsername());
        response.put("roles", roles);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<?> authenticateGoogle(@Valid @RequestBody GoogleAuthRequest googleRequest) {
        User user = userService.processGoogleUser(googleRequest);

        if ("REJECTED".equals(user.getStatus())) {
            return ResponseEntity.status(403).body(Map.of("message", "Your account has been suspended or banned."));
        }
        
        if ("PENDING".equals(user.getStatus())) {
            return ResponseEntity.status(403).body(Map.of("message", "Your account is still pending Admin approval."));
        }

        String jwt = jwtUtils.generateToken(user.getUsername());
        
        List<String> roles = user.getRoles().stream()
                .map(item -> item.getName())
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("roles", roles);
        response.put("status", user.getStatus());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            userService.generatePasswordResetToken(email);
            return ResponseEntity.ok(Map.of("message", "A password reset link has been sent to your email."));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            String message = userService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }
}
