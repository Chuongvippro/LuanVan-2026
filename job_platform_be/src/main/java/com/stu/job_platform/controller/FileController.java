package com.stu.job_platform.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/cv/{fileName}")
    public ResponseEntity<Resource> getCvFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir, "cv").resolve(fileName).normalize();

            // Chặn path traversal (vd fileName = "../../application.properties")
            if (!filePath.startsWith(Paths.get(uploadDir, "cv").normalize())) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = fileName.toLowerCase().endsWith(".pdf")
                    ? MediaType.APPLICATION_PDF_VALUE
                    : "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/bug/{fileName}")
    public ResponseEntity<Resource> getBugScreenshot(@PathVariable String fileName) {
        try {
            Path baseDir = Paths.get(uploadDir, "bug").normalize();
            Path filePath = baseDir.resolve(fileName).normalize();

            if (!filePath.startsWith(baseDir)) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String lower = fileName.toLowerCase();
            String contentType = lower.endsWith(".png") ? MediaType.IMAGE_PNG_VALUE
                    : (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) ? MediaType.IMAGE_JPEG_VALUE
                    : lower.endsWith(".webp") ? "image/webp"
                    : "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}