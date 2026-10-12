package com.coconutfarming.user.controller;

import com.coconutfarming.user.model.User;
import com.coconutfarming.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.coconutfarming.user.service.UserService;
import com.coconutfarming.user.dto.AdminDashboardStatsDto;
import com.coconutfarming.community.repository.ArticleRepository;
import com.coconutfarming.plantation.repository.LandRepository;
import com.coconutfarming.community.model.ArticleStatus;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
@PreAuthorize("hasAuthority('ADMIN')") // Role-based security
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private LandRepository landRepository;

    // 1. Get all pending users for approval
    @GetMapping("/pending-users")
    public List<com.coconutfarming.user.dto.UserProfileDto> getPendingUsers() {
        return userService.getPendingUserProfiles();
    }

    // 2. Approve a user
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setStatus("APPROVED");
        userRepository.save(user);
        return ResponseEntity.ok("User approved successfully!");
    }

    // 3. Reject/Suspend a user (Non-destructive)
    @PutMapping("/suspend-user/{id}")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        System.out.println("DEBUG: Rejecting user with ID: " + id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        if (user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"))) {
            return ResponseEntity.badRequest().body("Error: Cannot suspend an Admin user.");
        }

        user.setStatus("REJECTED");
        userRepository.save(user);
        System.out.println("DEBUG: User status set to REJECTED for: " + user.getUsername());
        return ResponseEntity.ok("User rejected/suspended successfully.");
    }

    // New: Actually Delete a user if really needed
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User permanently removed from system.");
    }

    // 4. Get all users in the system
    @GetMapping("/all-users")
    public List<com.coconutfarming.user.dto.UserProfileDto> getAllUsers() {
        return userService.getAllUserProfiles();
    }

    // 5. Create a new Admin
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody com.coconutfarming.user.dto.RegisterRequest request) {
        // Delegate to UserService to properly save with roles and status
        return ResponseEntity.ok(userService.registerAdmin(request));
    }

    // 6. Change a user's role
    @PutMapping("/change-role/{id}")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @RequestParam String newRole) {
        try {
            String result = userService.changeUserRole(id, newRole.toUpperCase());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to change role: " + e.getMessage());
        }
    }

    // 7. Update user details
    @PutMapping("/update-user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody com.coconutfarming.user.dto.UserProfileDto profileDto) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));
            
            if (user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"))) {
                return ResponseEntity.badRequest().body("Error: Cannot edit an Admin user.");
            }

            String result = userService.updateUserById(id, profileDto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update user: " + e.getMessage());
        }
    }

    // 8. Get dashboard statistics
    @GetMapping("/dashboard-stats")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        AdminDashboardStatsDto stats = new AdminDashboardStatsDto();
        
        // Basic Stats
        stats.setTotalUsers(userRepository.count());
        stats.setActiveOfficers(userRepository.countByRolesName("OFFICER"));
        stats.setTotalArticles(articleRepository.count());
        stats.setTotalLands(landRepository.count());

        // Recent Registrations (Last 2)
        List<User> recentUsers = userRepository.findTop2ByOrderByIdDesc();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy").withZone(ZoneId.systemDefault());
        
        stats.setRecentRegistrations(recentUsers.stream().map(u -> {
            String status = u.getStatus();
            if ("EMAIL_VERIFIED".equals(status)) status = "APPROVED";
            
            return new AdminDashboardStatsDto.RecentRegistrationDto(
                (u.getProfile() != null && u.getProfile().getFullName() != null) ? u.getProfile().getFullName() : u.getUsername(),
                u.getRoles().isEmpty() ? "USER" : u.getRoles().iterator().next().getName(),
                u.getCreatedAt() != null ? formatter.format(u.getCreatedAt()) : "Existing",
                status
            );
        }).collect(Collectors.toList()));

        // System Control Stats
        long fieldOfficersActive = userRepository.countByRolesNameAndStatus("OFFICER", "APPROVED");
        long totalFieldOfficers = stats.getActiveOfficers();
        long moderationPending = articleRepository.countByStatus(ArticleStatus.PENDING);
        long kbArticles = articleRepository.countByStatus(ArticleStatus.APPROVED);

        stats.setSystemControl(new AdminDashboardStatsDto.SystemControlDto(
            fieldOfficersActive,
            totalFieldOfficers,
            moderationPending,
            kbArticles
        ));

        return ResponseEntity.ok(stats);
    }
}