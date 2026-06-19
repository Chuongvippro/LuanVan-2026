package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.dto.JobPostResponse;
import com.stu.job_platform.entity.BugReport;
import com.stu.job_platform.entity.User;
import com.stu.job_platform.repository.BugReportRepository;
import com.stu.job_platform.repository.UserRepository;
import com.stu.job_platform.repository.JobPostRepository;
import com.stu.job_platform.repository.ApplicationRepository;
import com.stu.job_platform.service.JobPostService;
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

/**
 * Controller dành riêng cho Admin quản trị hệ thống
 */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JobPostRepository jobPostRepository;
    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private BugReportRepository bugReportRepository;
    @Autowired
    private JobPostService jobPostService;

    // ===== QUẢN LÝ TÀI KHOẢN =====

    /**
     * Lấy danh sách tất cả tài khoản
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userRepository.findAll()));
    }

    /**
     * Khóa/Mở khóa tài khoản (đổi status)
     */
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<?>> toggleUserStatus(
            @PathVariable Integer userId, @RequestBody Map<String, Integer> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));
        user.setStatus(body.get("status")); // 1: active, 0: locked
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái tài khoản thành công!"));
    }

    /**
     * Xóa tài khoản
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Tài khoản không tồn tại!");
        }
        userRepository.deleteById(userId);
        return ResponseEntity.ok(ApiResponse.success("Xóa tài khoản thành công!"));
    }

    // ===== QUẢN LÝ BÀI ĐĂNG =====

    /**
     * Lấy danh sách tất cả bài đăng (phân trang)
     */
    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<Page<JobPostResponse>>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(jobPostService.getAllJobsAdmin(pageable)));
    }

    /**
     * Ẩn/Hiện bài đăng
     */
    @PutMapping("/jobs/{jobId}/status")
    public ResponseEntity<ApiResponse<?>> toggleJobStatus(
            @PathVariable Integer jobId, @RequestBody Map<String, Integer> body) {
        jobPostService.toggleJobStatus(jobId, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái bài đăng thành công!"));
    }

    // ===== BÁO CÁO LỖI =====

    /**
     * Lấy danh sách tất cả báo cáo lỗi
     */
    @GetMapping("/bug-reports")
    public ResponseEntity<ApiResponse<List<BugReport>>> getAllBugReports() {
        return ResponseEntity.ok(ApiResponse.success(bugReportRepository.findAllByOrderByCreatedAtDesc()));
    }

    /**
     * Cập nhật trạng thái báo cáo lỗi
     */
    @PutMapping("/bug-reports/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateBugReportStatus(
            @PathVariable Integer id, @RequestBody Map<String, String> body) {
        BugReport bugReport = bugReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Báo cáo không tồn tại!"));
        bugReport.setStatus(body.get("status")); // resolved, rejected
        bugReportRepository.save(bugReport);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái báo cáo thành công!"));
    }

    // ===== THỐNG KÊ =====

    /**
     * Lấy thống kê tổng quan
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getStats() {
        long totalUsers = userRepository.count();
        long totalJobs = jobPostRepository.count();
        long totalApplications = applicationRepository.count();
        long pendingBugs = bugReportRepository.findByStatus("pending").size();

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "totalUsers", totalUsers,
                "totalJobs", totalJobs,
                "totalApplications", totalApplications,
                "pendingBugs", pendingBugs
        )));
    }
}
