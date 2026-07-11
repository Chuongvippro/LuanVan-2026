package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.service.BugReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/bug-reports")
public class BugReportController {

    @Autowired
    private BugReportService bugReportService;

    /** Gửi báo cáo lỗi — bắt buộc đã đăng nhập */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> submitBugReport(
            Authentication auth,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "screenshot", required = false) MultipartFile screenshot) {
        try {
            bugReportService.submitReport(auth, title, description, screenshot);
            return ResponseEntity.ok(ApiResponse.success("Gửi báo cáo lỗi thành công! Cảm ơn bạn đã phản hồi."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi gửi báo cáo. Vui lòng thử lại!"));
        }
    }
}