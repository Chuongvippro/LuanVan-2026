package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.dto.JobPostResponse;
import com.stu.job_platform.entity.ErrorLog;
import com.stu.job_platform.entity.User;
import com.stu.job_platform.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ===== USERS =====

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers()));
    }

    @GetMapping("/users/candidates")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCandidates() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getCandidates()));
    }

    @GetMapping("/users/recruiters")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecruiters() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRecruiters()));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<?>> toggleUserStatus(
            @PathVariable Integer userId, @RequestBody Map<String, Integer> body) {
        adminService.toggleUserStatus(userId, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái tài khoản thành công!"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Integer userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Xóa tài khoản thành công!"));
    }

    // ===== JOBS =====

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<Page<JobPostResponse>>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllJobs(pageable)));
    }

    @PutMapping("/jobs/{jobId}/status")
    public ResponseEntity<ApiResponse<?>> toggleJobStatus(
            @PathVariable Integer jobId, @RequestBody Map<String, Integer> body) {
        adminService.toggleJobStatus(jobId, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái bài đăng thành công!"));
    }

    // ===== ERROR LOGS =====

    @GetMapping("/error-logs")
    public ResponseEntity<ApiResponse<List<ErrorLog>>> getAllErrorLogs() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllErrorLogs()));
    }

    @PutMapping("/error-logs/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateErrorLogStatus(
            @PathVariable Integer id, @RequestBody Map<String, String> body) {
        adminService.updateErrorLogStatus(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái lỗi hệ thống thành công!"));
    }

    // ===== STATS =====

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats()));
    }
}