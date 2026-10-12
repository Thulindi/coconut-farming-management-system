package com.coconutfarming.user.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@CrossOrigin("*")
public class PublicController {

    @GetMapping(value = "/public/photos/{fileName}", produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_GIF_VALUE})
    public byte[] getPhoto(@PathVariable String fileName) {
        try {
            Path path = Paths.get("uploads").toAbsolutePath().resolve(fileName);
            if (Files.exists(path)) {
                return Files.readAllBytes(path);
            }
        } catch (Exception e) {
            // Log error if needed
        }
        return null;
    }
}
