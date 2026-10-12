package com.coconutfarming.plantation.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaFallbackController {

    @RequestMapping({"/{path}", "/{path}/**"})
    public String forward(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri == null) {
            return "forward:/index.html";
        }
        if (uri.startsWith("/api") || uri.equals("/error") || uri.contains(".")) {
            return null;
        }
        return "forward:/index.html";
    }
}
