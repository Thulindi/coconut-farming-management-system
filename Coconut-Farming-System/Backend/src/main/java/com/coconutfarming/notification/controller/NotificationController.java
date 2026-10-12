package com.coconutfarming.notification.controller;

import com.coconutfarming.notification.dto.NotificationResponse;
import com.coconutfarming.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{username}/{role}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(
            @PathVariable String username,
            @PathVariable String role) {
        return ResponseEntity.ok(notificationService.getUserNotifications(username, role));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @RequestParam String username) {
        notificationService.markAsRead(id, username);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all/{username}/{role}")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable String username,
            @PathVariable String role) {
        notificationService.markAllAsRead(username, role);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/broadcast")
    public ResponseEntity<?> broadcastMessage(@RequestBody BroadcastRequest request) {
        // Ideally this should check @PreAuthorize("hasRole('ADMIN')")
        notificationService.broadcastToAll(request.getMessage(), request.getType() != null ? request.getType() : "INFO");
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/all/{username}/{role}")
    public ResponseEntity<?> deleteAllNotifications(
            @PathVariable String username,
            @PathVariable String role) {
        notificationService.deleteAllUserNotifications(username, role);
        return ResponseEntity.ok().build();
    }
}

class BroadcastRequest {
    private String message;
    private String type;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
