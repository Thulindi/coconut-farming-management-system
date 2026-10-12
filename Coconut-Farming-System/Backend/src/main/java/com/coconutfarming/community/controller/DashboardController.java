package com.coconutfarming.community.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController("communityDashboardController")
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final com.coconutfarming.community.repository.ArticleRepository articleRepository;
    private final com.coconutfarming.user.repository.UserRepository userRepository;
    private final com.coconutfarming.community.repository.CategoryRepository categoryRepository;
    private final com.coconutfarming.community.repository.CommentRepository commentRepository;

    public DashboardController(com.coconutfarming.community.repository.ArticleRepository articleRepository,
                              com.coconutfarming.user.repository.UserRepository userRepository,
                              com.coconutfarming.community.repository.CategoryRepository categoryRepository,
                              com.coconutfarming.community.repository.CommentRepository commentRepository) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.commentRepository = commentRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Count total posts
        long totalPosts = articleRepository.count();
        stats.put("totalPosts", totalPosts);
        
        // Count total users
        long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);
        
        // Count total categories
        long totalCategories = categoryRepository.count();
        stats.put("totalCategories", totalCategories);
        
        // Count active users (users with articles)
        long activeUsers = articleRepository.findAll().stream()
                .map(article -> article.getUser())
                .distinct()
                .count();
        stats.put("activeUsers", activeUsers);
        
        // Count articles with comments
        long articlesWithComments = commentRepository.countArticlesWithComments();
        stats.put("engagedArticles", articlesWithComments);
        
        // Posts this week (mock data for now)
        stats.put("postsThisWeek", 5);
        
        // New users this month (mock data for now)
        stats.put("newUsersThisMonth", 8);
        
        return ResponseEntity.ok(stats);
    }
}
