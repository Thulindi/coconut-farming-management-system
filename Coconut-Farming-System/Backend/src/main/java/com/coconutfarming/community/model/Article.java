package com.coconutfarming.community.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import com.coconutfarming.user.model.User;

@Entity
@Table(name = "articles")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ArticleStatus status = ArticleStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "article_likes", joinColumns = @JoinColumn(name = "article_id"))
    @Column(name = "user_id")
    private Set<Long> likedByUserIds = new HashSet<>();

    @Column(columnDefinition = "LONGTEXT")
    private String articlePhoto;

    public Article() {
    }

    public Article(Long id, String title, String content, Category category, User user, Instant createdAt, Instant updatedAt, ArticleStatus status) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.category = category;
        this.user = user;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
    }

    public Set<Long> getLikedByUserIds() {
        return likedByUserIds;
    }

    public void setLikedByUserIds(Set<Long> likedByUserIds) {
        this.likedByUserIds = likedByUserIds;
    }

    public int getLikeCount() {
        return likedByUserIds != null ? likedByUserIds.size() : 0;
    }

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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public ArticleStatus getStatus() {
        return status;
    }

    public void setStatus(ArticleStatus status) {
        this.status = status;
    }

    public String getArticlePhoto() {
        return articlePhoto;
    }

    public void setArticlePhoto(String articlePhoto) {
        this.articlePhoto = articlePhoto;
    }
}

