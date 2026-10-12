package com.coconutfarming.notification.repository;

import com.coconutfarming.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find unread notifications for a specific user
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(String recipient);

    // Find all notifications for a specific user
    List<Notification> findByRecipientOrderByCreatedAtDesc(String recipient);
    
    // Support for broadcasting to role or "ALL"
    // So we can fetch like: OR recipient = "ALL" or recipient = userRole
    List<Notification> findByRecipientInOrderByCreatedAtDesc(List<String> recipients);
}
