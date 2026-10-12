package com.coconutfarming.community.repository;

import com.coconutfarming.community.model.Article;
import com.coconutfarming.community.model.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    @Override
    @EntityGraph(attributePaths = {"category", "user"})
    Page<Article> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"category", "user"})
    Page<Article> findByCategoryId(Long categoryId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"category", "user"})
    Optional<Article> findById(Long id);

    @EntityGraph(attributePaths = {"category", "user"})
    List<Article> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"category", "user"})
    Page<Article> findByStatus(ArticleStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "user"})
    Page<Article> findByStatusAndCategoryId(ArticleStatus status, Long categoryId, Pageable pageable);

    long countByStatus(ArticleStatus status);

    void deleteByUser(com.coconutfarming.user.model.User user);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM article_likes WHERE user_id = :userId", nativeQuery = true)
    void deleteLikesByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}

