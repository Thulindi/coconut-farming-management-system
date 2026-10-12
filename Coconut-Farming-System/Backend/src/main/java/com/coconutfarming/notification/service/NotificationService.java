package com.coconutfarming.notification.service;

import com.coconutfarming.notification.model.Notification;
import com.coconutfarming.notification.dto.NotificationResponse;
import com.coconutfarming.notification.repository.NotificationRepository;
import com.coconutfarming.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void createNotification(String recipient, String message, String type) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setType(type);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
    
    public void broadcastToAll(String message, String type) {
        createNotification("ALL", message, type);
    }
    
    public void notifyAdmins(String message, String type) {
        createNotification("ADMIN", message, type);
    }
    
    public void notifyOfficers(String message, String type) {
        createNotification("OFFICER", message, type);
    }

    public List<NotificationResponse> getUserNotifications(String username, String role) {
        Long userId = userRepository.findByUsername(username).map(u -> u.getId()).orElse(-1L);
        List<String> recipients = Arrays.asList(username, role, "ALL", userId.toString());
        
        List<Notification> notifications = notificationRepository.findByRecipientInOrderByCreatedAtDesc(recipients);
        
        return notifications.stream().map(n -> mapToResponse(n, username)).collect(Collectors.toList());
    }

    private NotificationResponse mapToResponse(Notification n, String username) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setRecipient(n.getRecipient());
        res.setMessage(n.getMessage());
        res.setType(n.getType());
        res.setCreatedAt(n.getCreatedAt());
        
        // A notification is read if:
        // 1. It's a personal notification and isRead is true (Legacy/Fallback)
        // 2. The username is in the readByUsers set (New robust way)
        res.setRead(n.isRead() || (n.getReadByUsers() != null && n.getReadByUsers().contains(username)));
        
        return res;
    }

    @Transactional
    public void markAsRead(Long id, String username) {
        notificationRepository.findById(id).ifPresent(notification -> {
            if (notification.getReadByUsers() == null) {
                notification.setReadByUsers(new java.util.HashSet<>());
            }
            notification.getReadByUsers().add(username);
            
            // For single-recipient notifications, also update the boolean for simplicity
            if (notification.getRecipient().equals(username)) {
                notification.setRead(true);
            }
            
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(String username, String role) {
        List<NotificationResponse> unread = getUserNotifications(username, role).stream()
                .filter(n -> !n.isRead())
                .toList();
        
        unread.forEach(n -> markAsRead(n.getId(), username));
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllUserNotifications(String username, String role) {
        // This is tricky. For broadcasts, we shouldn't delete the record for everyone.
        // We should just "hide" it for this user.
        // But for now, since the user asked for deletion, I'll delete personal ones 
        // and just mark broadcasts as read (or we could add a 'deletedByUsers' set).
        
        List<Notification> all = notificationRepository.findAll();
        List<String> userIdentifiers = Arrays.asList(username, role, "ALL");
        
        List<Notification> toProcess = all.stream()
            .filter(n -> userIdentifiers.contains(n.getRecipient()))
            .collect(Collectors.toList());
            
        for (Notification n : toProcess) {
            if (n.getRecipient().equals(username)) {
                // Personal: actually delete
                notificationRepository.delete(n);
            } else {
                // Broadcast: just mark as read so it's "cleared" from unread
                markAsRead(n.getId(), username);
            }
        }
    }
}
