package com.coconutfarming.plantation.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> root() {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("app", "Plantation Management API");
        payload.put("status", "running");
        payload.put("apiBase", "/api");
        return payload;
    }
}
