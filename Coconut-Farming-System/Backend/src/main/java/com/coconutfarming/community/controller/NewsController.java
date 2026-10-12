package com.coconutfarming.community.controller;

import com.coconutfarming.community.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsService newsService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAgricultureNews() {
        return ResponseEntity.ok(newsService.getAgricultureNews());
    }
}
