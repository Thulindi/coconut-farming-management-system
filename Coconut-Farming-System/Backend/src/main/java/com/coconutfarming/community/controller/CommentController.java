package com.coconutfarming.community.controller;

import com.coconutfarming.community.model.Comment;
import com.coconutfarming.community.dto.CommentDtos.CommentResponse;
import com.coconutfarming.community.repository.CommentRepository;
import com.coconutfarming.community.repository.ArticleRepository;
import com.coconutfarming.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    public CommentController(CommentRepository commentRepository, 
                           ArticleRepository articleRepository,
                           UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
    }

    // Get comments for a specific article
    @Transactional(readOnly = true)
    @GetMapping("/article/{articleId}")
    public List<CommentResponse> getCommentsByArticle(@PathVariable Long articleId) {
        List<Comment> comments = commentRepository.findByArticleIdOrderByCreatedAtDesc(articleId);
        return comments.stream().map(comment -> new CommentResponse(
            comment.getId(),
            comment.getContent(),
            comment.getUser() != null ? comment.getUser().getId() : null,
            comment.getUser() != null ? comment.getUser().getUsername() : "Anonymous",
            comment.getArticle().getId(),
            comment.getCreatedAt()
        )).collect(Collectors.toList());
    }

    // Create a new comment
    @Transactional
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody CommentRequest request) {
        if (request.articleId == null || request.userId == null) {
            return ResponseEntity.badRequest().body("Article ID and User ID must not be null");
        }

        Optional<com.coconutfarming.community.model.Article> articleOpt = articleRepository.findById(request.articleId);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Article not found");
        }

        Optional<com.coconutfarming.user.model.User> userOpt = userRepository.findById(request.userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        Comment comment = new Comment();
        comment.setContent(request.content);
        comment.setArticle(articleOpt.get());
        comment.setUser(userOpt.get());
        comment.setCreatedAt(Instant.now());
        comment.setUpdatedAt(Instant.now());
        
        Comment savedComment = commentRepository.save(comment);
        return ResponseEntity.ok(savedComment);
    }

    // Update a comment
    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody CommentRequest request) {
        if (request.userId == null) {
            return ResponseEntity.badRequest().body("User ID must not be null");
        }

        Optional<Comment> commentOpt = commentRepository.findById(id);
        if (commentOpt.isPresent()) {
            Comment comment = commentOpt.get();
            if (comment.getUser() == null || !comment.getUser().getId().equals(request.userId)) {
                return ResponseEntity.status(403).body("Only the author can update this comment");
            }
            comment.setContent(request.content);
            comment.setUpdatedAt(Instant.now());
            Comment updatedComment = commentRepository.save(comment);
            return ResponseEntity.ok(updatedComment);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete a comment
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id, @RequestParam Long userId, @RequestParam(defaultValue = "false") boolean isAdmin) {
        Optional<Comment> commentOpt = commentRepository.findById(id);
        if (commentOpt.isPresent()) {
            Comment comment = commentOpt.get();
            
            boolean isAuthor = comment.getUser() != null && comment.getUser().getId().equals(userId);
            boolean isArticleOwner = comment.getArticle() != null && comment.getArticle().getUser() != null && comment.getArticle().getUser().getId().equals(userId);
            
            if (!isAdmin && !isAuthor && !isArticleOwner) {
                return ResponseEntity.status(403).body("Not authorized to delete this comment");
            }
            
            commentRepository.delete(comment);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // DTO for request body
    public static class CommentRequest {
        public String content;
        public Long articleId;
        public Long userId;
    }
}
