package com.coconutfarming.community.controller;

import com.coconutfarming.community.dto.CategoryDtos;
import com.coconutfarming.community.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryDtos.CategoryResponse> list() {
        return categoryService.list();
    }

    @PostMapping
    public ResponseEntity<CategoryDtos.CategoryResponse> create(@RequestBody CategoryDtos.CategoryRequest request) {
        return ResponseEntity.ok(categoryService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDtos.CategoryResponse> update(@PathVariable Long id,
                                                                @RequestBody CategoryDtos.CategoryRequest request) {
        Optional<CategoryDtos.CategoryResponse> updated = categoryService.update(id, request);
        return updated.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

