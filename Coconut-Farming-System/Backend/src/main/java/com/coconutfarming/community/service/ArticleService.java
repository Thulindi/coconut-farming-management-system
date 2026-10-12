package com.coconutfarming.community.service;

import com.coconutfarming.community.dto.ArticleDtos;
import com.coconutfarming.community.model.Article;
import com.coconutfarming.community.model.ArticleStatus;
import com.coconutfarming.community.model.Category;
import com.coconutfarming.user.model.User;
import com.coconutfarming.community.repository.ArticleRepository;
import com.coconutfarming.community.repository.CategoryRepository;
import com.coconutfarming.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ArticleService(ArticleRepository articleRepository,
                          UserRepository userRepository,
                          CategoryRepository categoryRepository) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<ArticleDtos.ArticleResponse> list(int page, int size, ArticleStatus status) {
        Pageable pageable = PageRequest.of(page, size);
        if (status != null) {
            return articleRepository.findByStatus(status, pageable).map(this::toResponse);
        }
        return articleRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<ArticleDtos.ArticleResponse> get(Long id) {
        return articleRepository.findById(id).map(this::toResponse);
    }

    @Transactional
    public ArticleDtos.ArticleResponse create(Long userId, ArticleDtos.ArticleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        }

        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setUser(user);
        article.setCategory(category);
        article.setArticlePhoto(request.getArticlePhoto());

        Article saved = articleRepository.save(article);
        return toResponse(saved);
    }

    @Transactional
    public Optional<ArticleDtos.ArticleResponse> update(Long id, Long userId, ArticleDtos.ArticleRequest request, boolean isAdmin) {
        return articleRepository.findById(id).map(existing -> {
            if (!isAdmin && (existing.getUser() == null || !existing.getUser().getId().equals(userId))) {
                throw new IllegalStateException("Only the author can update this article");
            }
            existing.setTitle(request.getTitle());
            existing.setContent(request.getContent());
            if (request.getCategoryId() != null) {
                Category category = categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new IllegalArgumentException("Category not found"));
                existing.setCategory(category);
            }
            if (request.getArticlePhoto() != null) {
                existing.setArticlePhoto(request.getArticlePhoto());
            }
            Article saved = articleRepository.save(existing);
            return toResponse(saved);
        });
    }

    @Transactional
    public Optional<ArticleDtos.ArticleResponse> updateStatus(Long id, ArticleStatus status) {
        return articleRepository.findById(id).map(article -> {
            article.setStatus(status);
            Article saved = articleRepository.save(article);
            return toResponse(saved);
        });
    }

    @Transactional
    public void delete(Long id, Long userId, boolean isAdmin) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));
        
        // Allowed if author OR admin
        if (!isAdmin && (article.getUser() == null || !article.getUser().getId().equals(userId))) {
            throw new IllegalStateException("Not authorized to delete this article");
        }
        articleRepository.delete(article);
    }

    @Transactional
    public Optional<ArticleDtos.ArticleResponse> likeArticle(Long id, Long userId) {
        return articleRepository.findById(id).map(article -> {
            if (article.getLikedByUserIds().contains(userId)) {
                // Unlike if already liked
                article.getLikedByUserIds().remove(userId);
            } else {
                // Like
                article.getLikedByUserIds().add(userId);
            }
            Article saved = articleRepository.save(article);
            return toResponse(saved);
        });
    }

    private ArticleDtos.ArticleResponse toResponse(Article article) {
        ArticleDtos.ArticleResponse dto = new ArticleDtos.ArticleResponse();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setContent(article.getContent());
        if (article.getCategory() != null) {
            dto.setCategoryId(article.getCategory().getId());
            dto.setCategoryName(article.getCategory().getName());
        }
        if (article.getUser() != null) {
            dto.setUserId(article.getUser().getId());
            dto.setUserName(article.getUser().getUsername());
        }
        dto.setCreatedAt(article.getCreatedAt());
        dto.setUpdatedAt(article.getUpdatedAt());
        dto.setStatus(article.getStatus().name());
        dto.setLikeCount(article.getLikeCount());
        dto.setLikedByUserIds(article.getLikedByUserIds());
        dto.setArticlePhoto(article.getArticlePhoto());
        return dto;
    }
}

