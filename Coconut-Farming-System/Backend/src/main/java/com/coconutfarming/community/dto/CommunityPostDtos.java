package com.coconutfarming.community.dto;

import java.time.Instant;

public class CommunityPostDtos {
    
    public static class CommunityPostResponse {
        private Long id;
        private String title;
        private String content;
        private String userName;
        private Instant createdAt;
        
        public CommunityPostResponse() {}
        
        public CommunityPostResponse(Long id, String title, String content, String userName, Instant createdAt) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.userName = userName;
            this.createdAt = createdAt;
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }
}
