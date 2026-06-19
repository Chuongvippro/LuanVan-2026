package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.entity.Candidate;
import com.stu.job_platform.service.FileUploadService;
import com.stu.job_platform.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Controller quản lý CV của ứng viên
 */
@RestController
@RequestMapping("/api/v1/cv")
public class CvController {

    @Autowired
    private CandidateRepository candidateRepository;
    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Upload CV mới
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<?>> uploadCv(
            Authentication auth,
            @RequestParam("file") MultipartFile file) {

        Integer candidateId = (Integer) auth.getPrincipal();
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Ứng viên không tồn tại!"));

        // Xóa CV cũ nếu có
        if (candidate.getCvPath() != null) {
            fileUploadService.deleteFile(candidate.getCvPath());
        }

        // Upload CV mới
        String cvPath = fileUploadService.uploadFile(file, "cv");
        candidate.setCvPath(cvPath);
        candidateRepository.save(candidate);

        return ResponseEntity.ok(ApiResponse.success("Upload CV thành công!", cvPath));
    }

    /**
     * Lấy thông tin CV hiện tại
     */
    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<?>> getCvInfo(Authentication auth) {
        Integer candidateId = (Integer) auth.getPrincipal();
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Ứng viên không tồn tại!"));

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "cvPath", candidate.getCvPath() != null ? candidate.getCvPath() : "",
                "skills", candidate.getSkills() != null ? candidate.getSkills() : ""
        )));
    }

    /**
     * Cập nhật skills
     */
    @PutMapping("/skills")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<?>> updateSkills(
            Authentication auth, @RequestBody Map<String, String> body) {
        Integer candidateId = (Integer) auth.getPrincipal();
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Ứng viên không tồn tại!"));

        candidate.setSkills(body.get("skills"));
        candidateRepository.save(candidate);

        return ResponseEntity.ok(ApiResponse.success("Cập nhật skills thành công!"));
    }

    /**
     * Xóa CV
     */
    @DeleteMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<?>> deleteCv(Authentication auth) {
        Integer candidateId = (Integer) auth.getPrincipal();
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Ứng viên không tồn tại!"));

        if (candidate.getCvPath() != null) {
            fileUploadService.deleteFile(candidate.getCvPath());
            candidate.setCvPath(null);
            candidateRepository.save(candidate);
        }

        return ResponseEntity.ok(ApiResponse.success("Xóa CV thành công!"));
    }
}
