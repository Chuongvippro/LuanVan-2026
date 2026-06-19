package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.entity.Application;
import com.stu.job_platform.service.ApplicationService;
import com.stu.job_platform.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;
    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Ứng viên ứng tuyển vào bài đăng (kèm upload CV)
     */
    @PostMapping("/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<?>> applyToJob(
            @PathVariable Integer jobId,
            Authentication auth,
            @RequestParam("cv") MultipartFile cvFile,
            @RequestParam(value = "coverLetter", required = false) String coverLetter) {

        Integer candidateId = (Integer) auth.getPrincipal();

        // Upload file CV
        String cvPath = fileUploadService.uploadFile(cvFile, "cv");

        Application application = applicationService.applyToJob(candidateId, jobId, cvPath, coverLetter);
        return ResponseEntity.ok(ApiResponse.success("Ứng tuyển thành công!", application.getId()));
    }

    /**
     * Recruiter xem danh sách ứng viên đã nộp vào bài đăng
     */
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<Application>>> getApplicationsByJob(@PathVariable Integer jobId) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationsByJobPost(jobId)));
    }

    /**
     * Candidate xem lịch sử ứng tuyển của mình
     */
    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<Application>>> getMyApplications(Authentication auth) {
        Integer candidateId = (Integer) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationsByCandidate(candidateId)));
    }

    /**
     * Recruiter duyệt/từ chối đơn ứng tuyển
     */
    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable Integer applicationId,
            Authentication auth,
            @RequestBody Map<String, Integer> body) {

        Integer recruiterId = (Integer) auth.getPrincipal();
        Integer status = body.get("status");
        applicationService.updateApplicationStatus(applicationId, recruiterId, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công!"));
    }
}
