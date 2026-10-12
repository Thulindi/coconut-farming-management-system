package com.coconutfarming.community.dto;

import java.time.Instant;

import java.util.Set;

public class ArticleDtos {

    public static class ArticleRequest {
        private String title;
        private String content;
        private Long categoryId;
        private String articlePhoto;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public Long getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }

        public String getArticlePhoto() {
            return articlePhoto;
        }

        public void setArticlePhoto(String articlePhoto) {
            this.articlePhoto = articlePhoto;
        }
    }

    public static class ArticleResponse {
        private Long id;
        private String title;
        private String content;
        private Long categoryId;
        private String categoryName;
        private Long userId;
        private String userName;
        private Instant createdAt;
        private Instant updatedAt;
        private String status;
        private int likeCount;
        private Set<Long> likedByUserIds;
        private String articlePhoto;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public Long getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }

        public Instant getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(Instant updatedAt) {
            this.updatedAt = updatedAt;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public int getLikeCount() {
            return likeCount;
        }

        public void setLikeCount(int likeCount) {
            this.likeCount = likeCount;
        }

        public Set<Long> getLikedByUserIds() {
            return likedByUserIds;
        }

        public void setLikedByUserIds(Set<Long> likedByUserIds) {
            this.likedByUserIds = likedByUserIds;
        }

        public String getArticlePhoto() {
            return articlePhoto;
        }

        public void setArticlePhoto(String articlePhoto) {
            this.articlePhoto = articlePhoto;
        }
    }
}

