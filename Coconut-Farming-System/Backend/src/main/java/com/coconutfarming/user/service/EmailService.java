package com.coconutfarming.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String username, String token) {
        String verificationLink = baseUrl + "/api/auth/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("CocoSmart - Verify Your Email Address");
        message.setText(
            "Hi " + username + ",\n\n" +
            "Welcome to CocoSmart - Coconut Farming Management System!\n\n" +
            "Please click the link below to verify your email address and activate your account:\n\n" +
            verificationLink + "\n\n" +
            "This link will allow you to log in to your account immediately after verification.\n\n" +
            "If you did not register for CocoSmart, please ignore this email.\n\n" +
            "Best regards,\n" +
            "The CocoSmart Team"
        );

        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String username, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("CocoSmart - Password Reset Request");
        message.setText(
            "Hi " + username + ",\n\n" +
            "We received a request to reset your password for your CocoSmart account.\n\n" +
            "Click the link below to set a new password:\n\n" +
            "Reset Password: " + resetLink + "\n\n" +
            "This link will expire in 30 minutes. If you did not request a password reset, please ignore this email.\n\n" +
            "Best regards,\n" +
            "The CocoSmart Team"
        );

        mailSender.send(message);
    }
}
