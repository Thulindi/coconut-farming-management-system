package com.coconutfarming.community.service;

import com.coconutfarming.community.dto.CategoryDtos;
import com.coconutfarming.community.model.Category;
import com.coconutfarming.community.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDtos.CategoryResponse> list() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryDtos.CategoryResponse create(CategoryDtos.CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    public Optional<CategoryDtos.CategoryResponse> update(Long id, CategoryDtos.CategoryRequest request) {
        return categoryRepository.findById(id).map(existing -> {
            existing.setName(request.getName());
            existing.setDescription(request.getDescription());
            Category saved = categoryRepository.save(existing);
            return toResponse(saved);
        });
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryDtos.CategoryResponse toResponse(Category category) {
        CategoryDtos.CategoryResponse dto = new CategoryDtos.CategoryResponse();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        return dto;
    }
}

