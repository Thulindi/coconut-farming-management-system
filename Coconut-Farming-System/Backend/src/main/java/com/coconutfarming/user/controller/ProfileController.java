package com.coconutfarming.user.controller;

import com.coconutfarming.user.dto.UserProfileDto;
import com.coconutfarming.user.dto.PasswordChangeRequest;
import com.coconutfarming.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin("*")
public class ProfileController {

    @Autowired
    private UserService userService;

    //get profile
    @GetMapping("/{username}")
    public ResponseEntity<UserProfileDto> getProfile(@PathVariable String username) {
        UserProfileDto profile = userService.getUserProfile(username);
        return ResponseEntity.ok(profile);
    }

    //update profile
    @PutMapping("/{username}")
    public ResponseEntity<String> updateProfile(@PathVariable String username, @RequestBody UserProfileDto profileDto) {
        String result = userService.updateUserProfile(username, profileDto);
        return ResponseEntity.ok(result);
    }

    //upload photo
    @PostMapping("/{username}/photo")
    public ResponseEntity<String> uploadPhoto(@PathVariable String username,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String fileName = userService.saveProfilePhoto(username, file);
            String photoUrl = "/public/photos/" + fileName;
            return ResponseEntity.ok(photoUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload photo: " + e.getMessage());
        }
    }

    //change password
    @PutMapping("/{username}/password")
    public ResponseEntity<String> changePassword(@PathVariable String username, @RequestBody PasswordChangeRequest request) {
        try {
            String result = userService.changePassword(username, request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
