package com.coconutfarming.community.controller;

import com.coconutfarming.community.dto.ArticleDtos;
import com.coconutfarming.community.model.Article;
import com.coconutfarming.community.model.ArticleStatus;
import com.coconutfarming.community.repository.ArticleRepository;
import com.coconutfarming.community.service.ArticleService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "*")
public class ArticleController {

    private final ArticleService articleService;
    private final ArticleRepository articleRepository;

    public ArticleController(ArticleService articleService,
                             ArticleRepository articleRepository) {
        this.articleService = articleService;
        this.articleRepository = articleRepository;
    }

    @GetMapping
    public Page<ArticleDtos.ArticleResponse> list(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size,
                                                  @RequestParam(required = false) ArticleStatus status) {
        return articleService.list(page, size, status);
    }

    @Transactional(readOnly = true)
    @GetMapping("/community")
    public List<CommunityPostResponse> getCommunityPosts() {
        // Return all articles, frontend will filter based on status and authorship
        List<Article> articles = articleRepository.findAll(org.springframework.data.domain.PageRequest.of(0, 100)).getContent();
        return articles.stream().map(article -> new CommunityPostResponse(
            article.getId(),
            article.getTitle(),
            article.getContent(),
            article.getUser() != null ? article.getUser().getUsername() : "Anonymous",
            article.getUser() != null ? article.getUser().getId() : null,
            article.getCategory() != null ? article.getCategory().getId() : null,
            article.getCategory() != null ? article.getCategory().getName() : "General",
            article.getCreatedAt(),
            article.getStatus().name(),
            article.getLikeCount(),
            article.getLikedByUserIds(),
            article.getArticlePhoto()
        )).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleDtos.ArticleResponse> get(@PathVariable Long id) {
        Optional<ArticleDtos.ArticleResponse> article = articleService.get(id);
        return article.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ArticleDtos.ArticleResponse> createCommunityPost(@RequestBody CommunityPostRequest request) {
        ArticleDtos.ArticleRequest articleRequest = new ArticleDtos.ArticleRequest();
        articleRequest.setTitle(request.title);
        articleRequest.setContent(request.content);
        articleRequest.setCategoryId(request.categoryId);
        articleRequest.setArticlePhoto(request.articlePhoto);
        
        Long userId = request.userId != null ? request.userId : 1L;
        ArticleDtos.ArticleResponse createdArticle = articleService.create(userId, articleRequest);
        return ResponseEntity.ok(createdArticle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArticleDtos.ArticleResponse> updateCommunityPost(@PathVariable Long id, @RequestBody CommunityPostRequest request, @RequestParam(defaultValue = "false") boolean isAdmin) {
        ArticleDtos.ArticleRequest articleRequest = new ArticleDtos.ArticleRequest();
        articleRequest.setTitle(request.title);
        articleRequest.setContent(request.content);
        articleRequest.setCategoryId(request.categoryId);
        articleRequest.setArticlePhoto(request.articlePhoto);
        
        if (request.userId == null) {
            return ResponseEntity.badRequest().build();
        }

        return articleService.update(id, request.userId, articleRequest, isAdmin)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestParam Long userId, @RequestParam(defaultValue = "false") boolean isAdmin) {
        articleService.delete(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ArticleDtos.ArticleResponse> likeArticle(@PathVariable Long id, @RequestParam Long userId) {
        Optional<ArticleDtos.ArticleResponse> response = articleService.likeArticle(id, userId);
        return response.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ArticleDtos.ArticleResponse> updateStatus(@PathVariable Long id, @RequestParam ArticleStatus status) {
        return articleService.updateStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DTO for community posts
    public static class CommunityPostResponse {
        public Long id;
        public String title;
        public String content;
        public String userName;
        public Long userId;
        public Long categoryId;
        public String categoryName;
        public Instant createdAt;
        public String status;
        public int likeCount;
        public java.util.Set<Long> likedByUserIds;
        public String articlePhoto;

        public CommunityPostResponse(Long id, String title, String content, String userName, Long userId, Long categoryId, String categoryName, Instant createdAt, String status, int likeCount, java.util.Set<Long> likedByUserIds, String articlePhoto) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.userName = userName;
            this.userId = userId;
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.createdAt = createdAt;
            this.status = status;
            this.likeCount = likeCount;
            this.likedByUserIds = likedByUserIds;
            this.articlePhoto = articlePhoto;
        }
    }

    public static class CommunityPostRequest {
        public String title;
        public String content;
        public Long categoryId;
        public Long userId;
        public String articlePhoto;
    }
}
