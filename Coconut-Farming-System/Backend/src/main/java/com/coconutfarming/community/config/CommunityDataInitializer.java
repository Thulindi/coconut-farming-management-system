package com.coconutfarming.community.config;

import com.coconutfarming.community.model.Category;
import com.coconutfarming.community.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class CommunityDataInitializer {

    @Bean
    CommandLineRunner initCommunityCategories(CategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() == 0) {
                Category c1 = new Category();
                c1.setName("Pests & Diseases");
                c1.setDescription("Articles related to identifying and managing coconut pests.");
                
                Category c2 = new Category();
                c2.setName("Fertilizing");
                c2.setDescription("Best practices for nourishing coconut trees.");
                
                Category c3 = new Category();
                c3.setName("Harvesting");
                c3.setDescription("Guidelines and techniques for coconut harvesting.");
                
                Category c4 = new Category();
                c4.setName("General");
                c4.setDescription("General discussions and news about coconut farming.");
                
                categoryRepository.saveAll(Arrays.asList(c1, c2, c3, c4));
                System.out.println("Default community categories initialized.");
            }
        };
    }
}
