package com.coconutfarming.user.service;

import com.coconutfarming.user.model.User;
import com.coconutfarming.user.model.Role;
import com.coconutfarming.user.model.Profile;
import com.coconutfarming.user.dto.RegisterRequest;
import com.coconutfarming.user.repository.UserRepository;
import com.coconutfarming.user.repository.RoleRepository;
import com.coconutfarming.user.repository.ProfileRepository;
import com.coconutfarming.plantation.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.coconutfarming.user.model.PasswordResetToken;
import com.coconutfarming.user.repository.PasswordResetTokenRepository;
import com.coconutfarming.notification.service.NotificationService;
import com.coconutfarming.user.dto.GoogleAuthRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;

import java.util.Collections;

import com.coconutfarming.user.dto.UserProfileDto;

import java.util.HashSet;
import java.util.Set;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import java.util.regex.Pattern;
import jakarta.transaction.Transactional;

import com.coconutfarming.user.dto.PasswordChangeRequest;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Value("${google.client.id}")
    private String googleClientId;

    @Autowired
    private com.coconutfarming.plantation.repository.LandRepository landRepository;

    @Autowired
    private com.coconutfarming.community.repository.ArticleRepository articleRepository;

    public java.util.Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public String registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        validatePassword(request.getPassword());

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Set<Role> roles = new HashSet<>();
        boolean isOfficer = false;

        if (request.getRoles() != null) {
            request.getRoles().forEach(role -> {
                if (role.equals("ADMIN")) {
                    throw new RuntimeException("Error: Cannot register as ADMIN via public endpoint.");
                }
                Role userRole = roleRepository.findByName(String.valueOf(role))
                        .orElseThrow(() -> new ResourceNotFoundException("Error: Role not found."));
                roles.add(userRole);
            });
            isOfficer = request.getRoles().contains("OFFICER");
        }

        // If no roles specified, default to FARMER
        if (roles.isEmpty()) {
            Role defaultRole = roleRepository.findByName("FARMER")
                    .orElseThrow(() -> new ResourceNotFoundException("Error: Default role FARMER not found."));
            roles.add(defaultRole);
        }

        user.setRoles(roles);

        if (isOfficer) {
            // Officer: auto-approved, no email verification
            user.setStatus("APPROVED");
            user.setOfficerId(request.getOfficerId());
        } else {
            // Farmer: email verification required, no admin approval needed
            String verificationToken = UUID.randomUUID().toString();
            user.setStatus("EMAIL_PENDING");
            user.setEmailVerificationToken(verificationToken);
            user.setEmailVerified(false);
        }

        // Save User First to get ID
        User savedUser = userRepository.save(user);

        // Create matching Profile
        Profile profile = new Profile();
        profile.setUser(savedUser);

        // Save district explicitly to profile if officer
        if (isOfficer && request.getDistrict() != null) {
            profile.setDistrict(request.getDistrict());
        }

        profileRepository.save(profile);

        try {
            notificationService.notifyAdmins("New User Registered: " + savedUser.getUsername() + " (Role: " + roles.iterator().next().getName() + ")", "INFO");
        } catch (Exception e) {}

        // Send verification email to farmers
        if (!isOfficer) {
            try {
                emailService.sendVerificationEmail(
                    savedUser.getEmail(),
                    savedUser.getUsername(),
                    savedUser.getEmailVerificationToken()
                );
            } catch (Exception e) {
                // Log but don't fail registration if email sending fails
                System.err.println("Warning: Could not send verification email to " + savedUser.getEmail() + ": " + e.getMessage());
            }
            return "Registration successful! Please check your email (" + request.getEmail() + ") to verify your account.";
        }

        return "Registration successful! Your account is pending Admin approval.";
    }

    @Transactional
    public User processGoogleUser(GoogleAuthRequest googleRequest) {
        String tokenId = googleRequest.getTokenId();
        String requestedRole = googleRequest.getRole();
        String requestedOfficerId = googleRequest.getOfficerId();

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(tokenId);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google Token");
            }

            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            java.util.Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                return existingUser.get();
            }

            // If user doesn't exist, they MUST provide a role (meaning they are registering)
            if (requestedRole == null || requestedRole.isEmpty()) {
                throw new RuntimeException("Account not found. Please register first using the Sign Up page.");
            }

            // Create new user if not exists
            User user = new User();
            // Use email as username prefix or extract from name
            String baseUsername = email.split("@")[0];
            String username = baseUsername;
            int counter = 1;
            while (userRepository.existsByUsername(username)) {
                username = baseUsername + counter++;
            }
            user.setUsername(username);
            user.setEmail(email);
            // Default password for Google users (won't be used for login)
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

            Set<Role> roles = new HashSet<>();
            String roleName = (requestedRole != null) ? requestedRole.toUpperCase() : "FARMER";
            
            if (roleName.equals("ADMIN")) roleName = "FARMER"; // Prevent registration as Admin

            final String finalRoleName = roleName;
            Role userRole = roleRepository.findByName(finalRoleName)
                    .orElseThrow(() -> new ResourceNotFoundException("Error: Role " + finalRoleName + " not found."));
            roles.add(userRole);
            user.setRoles(roles);

            if (roleName.equals("OFFICER")) {
                if (requestedOfficerId == null || requestedOfficerId.trim().isEmpty()) {
                    throw new RuntimeException("Officer ID is required for registration.");
                }
                user.setOfficerId(requestedOfficerId);
                user.setStatus("APPROVED");
            } else {
                // Farmers from Google are auto-verified
                user.setStatus("EMAIL_VERIFIED");
                user.setEmailVerified(true);
            }

            User savedUser = userRepository.save(user);

            // Create Profile
            Profile profile = new Profile();
            profile.setUser(savedUser);
            profile.setFullName(name);
            profile.setProfilePhoto(pictureUrl);
            profileRepository.save(profile);

            try {
                notificationService.notifyAdmins("New Google User: " + savedUser.getUsername() + " (" + roleName + ")", "INFO");
            } catch (Exception e) {}

            return savedUser;

        } catch (Exception e) {
            throw new RuntimeException("Google Authentication Failed: " + e.getMessage());
        }
    }

    public String registerAdmin(RegisterRequest request) {
        validatePassword(request.getPassword());
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Admins are auto-approved
        user.setStatus("APPROVED");

        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new ResourceNotFoundException("Error: ADMIN Role not found."));
        roles.add(adminRole);

        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        Profile profile = new Profile();
        profile.setUser(savedUser);
        profileRepository.save(profile);

        return "Admin created successfully!";
    }

    public UserProfileDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElse(new Profile()); // Fallback empty profile just in case

        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setStatus(user.getStatus());
        dto.setOfficerId(user.getOfficerId());

        dto.setFullName(profile.getFullName());
        dto.setProfilePhoto(profile.getProfilePhoto());
        dto.setDistrict(profile.getDistrict());
        dto.setPhone(profile.getPhone());
        dto.setDepartment(profile.getDepartment());
        dto.setDesignation(profile.getDesignation());

        Set<String> roles = new HashSet<>();
        for (Role role : user.getRoles()) {
            roles.add(role.getName());
        }
        dto.setRoles(roles);

        return dto;
    }

    public String updateUserProfile(String username, UserProfileDto profileDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return updateUserById(user.getId(), profileDto);
    }

    @Transactional
    public String updateUserById(Long id, UserProfileDto profileDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        // Update User fields if provided
        if (profileDto.getUsername() != null && !profileDto.getUsername().isEmpty()) {
            // Check if username unique
            if (!user.getUsername().equals(profileDto.getUsername()) && userRepository.existsByUsername(profileDto.getUsername())) {
                throw new RuntimeException("Error: Username is already taken!");
            }
            user.setUsername(profileDto.getUsername());
        }
        if (profileDto.getEmail() != null && !profileDto.getEmail().isEmpty()) {
            if (!user.getEmail().equals(profileDto.getEmail()) && userRepository.existsByEmail(profileDto.getEmail())) {
                throw new RuntimeException("Error: Email is already in use!");
            }
            user.setEmail(profileDto.getEmail());
        }
        if (profileDto.getStatus() != null) {
            user.setStatus(profileDto.getStatus());
        }
        if (profileDto.getOfficerId() != null) {
            user.setOfficerId(profileDto.getOfficerId());
        }

        userRepository.save(user);

        // Update Profile fields
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Profile np = new Profile();
                    np.setUser(user);
                    return np;
                });

        if (profileDto.getFullName() != null)
            profile.setFullName(profileDto.getFullName());
        if (profileDto.getProfilePhoto() != null)
            profile.setProfilePhoto(profileDto.getProfilePhoto());
        if (profileDto.getDistrict() != null)
            profile.setDistrict(profileDto.getDistrict());
        if (profileDto.getPhone() != null)
            profile.setPhone(profileDto.getPhone());
        if (profileDto.getDepartment() != null)
            profile.setDepartment(profileDto.getDepartment());
        if (profileDto.getDesignation() != null)
            profile.setDesignation(profileDto.getDesignation());

        profileRepository.save(profile);
        return "User updated successfully";
    }

    @Transactional
    public String changeUserRole(Long userId, String newRoleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Role newRole = roleRepository.findByName(newRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role '" + newRoleName + "' not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(newRole);
        user.setRoles(roles);

        userRepository.save(user);

        return "User role updated to " + newRoleName + " successfully.";
    }

    public String saveProfilePhoto(String username, MultipartFile file) throws java.io.IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Profile np = new Profile();
                    np.setUser(user);
                    return np;
                });

        String uploadDir = "uploads/";
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String photoUrl = "/public/photos/" + fileName;
        profile.setProfilePhoto(photoUrl);
        profileRepository.save(profile);

        return fileName;
    }

    public java.util.List<UserProfileDto> getAllUserProfiles() {
        return userRepository.findAll().stream()
                .map(user -> getUserProfile(user.getUsername()))
                .collect(java.util.stream.Collectors.toList());
    }

    public java.util.List<UserProfileDto> getPendingUserProfiles() {
        return userRepository.findAll().stream()
                .filter(user -> "PENDING".equals(user.getStatus()) &&
                        user.getRoles().stream().anyMatch(role -> role.getName().equals("OFFICER")))
                .map(user -> getUserProfile(user.getUsername()))
                .collect(java.util.stream.Collectors.toList());
    }
    public String changePassword(String username, PasswordChangeRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Error: Current password is incorrect!");
        }

        String newPassword = request.getNewPassword();
        validatePassword(newPassword);

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Password changed successfully!";
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        // 1. Cleanup Related Data to avoid Foreign Key Violations
        
        // Delete Articles (and their content)
        try {
            articleRepository.deleteByUser(user);
        } catch (Exception e) {
            System.err.println("Warning: Could not delete articles for user: " + e.getMessage());
        }

        // Delete Article Likes
        try {
            articleRepository.deleteLikesByUserId(id);
        } catch (Exception e) {
            System.err.println("Warning: Could not delete likes for user: " + e.getMessage());
        }

        // Delete Lands (this will cascade to fertilizer schedules and harvest records via Land model)
        try {
            landRepository.deleteByFarmerId(id);
        } catch (Exception e) {
            System.err.println("Warning: Could not delete lands for user: " + e.getMessage());
        }

        // 2. Delete User (this will cascade to Profile via User model CascadeType.ALL)
        userRepository.delete(user);
    }

    @Transactional
    public void generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email address."));

        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token);
    }

    @Transactional
    public String resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired password reset link."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("This password reset link has expired.");
        }

        validatePassword(newPassword);

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete the token after successful use
        tokenRepository.delete(resetToken);

        return "Password has been reset successfully. You can now log in with your new password.";
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 6) {
            throw new RuntimeException("Error: Password must be at least 6 characters long!");
        }

        Pattern specialCharPattern = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");
        if (!specialCharPattern.matcher(password).find()) {
            throw new RuntimeException("Error: Password must contain at least one special character!");
        }
    }
}
