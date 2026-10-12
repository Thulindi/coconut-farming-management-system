package com.coconutfarming.community.repository;

import com.coconutfarming.community.model.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = {"user", "article"})
    List<Comment> findByArticleIdOrderByCreatedAtDesc(Long articleId);

    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    long countByArticleId(Long articleId);

    @Query("SELECT COUNT(DISTINCT c.article.id) FROM Comment c WHERE c.article.status = 'APPROVED'")
    long countArticlesWithComments();
}
