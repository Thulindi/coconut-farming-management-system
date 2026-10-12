package com.coconutfarming.community.dto;

import java.time.Instant;

public class CommentDtos {
    
    public static class CommentResponse {
        private Long id;
        private String content;
        private Long userId;
        private String userName;
        private Long articleId;
        private Instant createdAt;
        
        public CommentResponse() {}
        
        public CommentResponse(Long id, String content, Long userId, String userName, Long articleId, Instant createdAt) {
            this.id = id;
            this.content = content;
            this.userId = userId;
            this.userName = userName;
            this.articleId = articleId;
            this.createdAt = createdAt;
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        
        public Long getArticleId() { return articleId; }
        public void setArticleId(Long articleId) { this.articleId = articleId; }
        
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }
}
