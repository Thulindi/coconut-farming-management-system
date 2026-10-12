package com.coconutfarming.user.dto;

import java.util.List;

public class AdminDashboardStatsDto {
    private long totalLands;
    private long totalArticles;
    private long totalUsers;
    private long activeOfficers;
    private List<RecentRegistrationDto> recentRegistrations;
    private SystemControlDto systemControl;

    public static class RecentRegistrationDto {
        private String name;
        private String role;
        private String date;
        private String status;

        public RecentRegistrationDto(String name, String role, String date, String status) {
            this.name = name;
            this.role = role;
            this.date = date;
            this.status = status;
        }

        public String getName() { return name; }
        public String getRole() { return role; }
        public String getDate() { return date; }
        public String getStatus() { return status; }
    }

    public static class SystemControlDto {
        private long fieldOfficersActive;
        private long totalFieldOfficers;
        private long communityModerationPending;
        private long knowledgeBaseArticlesTotal;

        public SystemControlDto(long fieldOfficersActive, long totalFieldOfficers, long communityModerationPending, long knowledgeBaseArticlesTotal) {
            this.fieldOfficersActive = fieldOfficersActive;
            this.totalFieldOfficers = totalFieldOfficers;
            this.communityModerationPending = communityModerationPending;
            this.knowledgeBaseArticlesTotal = knowledgeBaseArticlesTotal;
        }

        public long getFieldOfficersActive() { return fieldOfficersActive; }
        public long getTotalFieldOfficers() { return totalFieldOfficers; }
        public long getCommunityModerationPending() { return communityModerationPending; }
        public long getKnowledgeBaseArticlesTotal() { return knowledgeBaseArticlesTotal; }
    }

    // Getters and Setters
    public long getTotalLands() { return totalLands; }
    public void setTotalLands(long totalLands) { this.totalLands = totalLands; }
    public long getTotalArticles() { return totalArticles; }
    public void setTotalArticles(long totalArticles) { this.totalArticles = totalArticles; }
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getActiveOfficers() { return activeOfficers; }
    public void setActiveOfficers(long activeOfficers) { this.activeOfficers = activeOfficers; }
    public List<RecentRegistrationDto> getRecentRegistrations() { return recentRegistrations; }
    public void setRecentRegistrations(List<RecentRegistrationDto> recentRegistrations) { this.recentRegistrations = recentRegistrations; }
    public SystemControlDto getSystemControl() { return systemControl; }
    public void setSystemControl(SystemControlDto systemControl) { this.systemControl = systemControl; }
}
