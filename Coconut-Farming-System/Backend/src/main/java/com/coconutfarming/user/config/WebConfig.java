package com.coconutfarming.user.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve profile photos from the uploads directory
        registry.addResourceHandler("/public/photos/**")
                .addResourceLocations("file:uploads/");
    }
}
