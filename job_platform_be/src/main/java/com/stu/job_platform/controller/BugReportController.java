package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.entity.BugReport;
import com.stu.job_platform.entity.User;
import com.stu.job_platform.repository.BugReportRepository;
import com.stu.job_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller cho người dùng gửi báo cáo lỗi hệ thống
 */
@RestController
@RequestMapping("/api/v1/bug-reports")
public class BugReportController {

    @Autowired
    private BugReportRepository bugReportRepository;
    @Autowired
    private UserRepository userRepository;

    /**
     * Gửi báo cáo lỗi
     */
    @PostMapping
    public ResponseEntity<ApiResponse<?>> submitBugReport(
            Authentication auth, @RequestBody Map<String, String> body) {
        Integer userId = (Integer) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));

        BugReport report = new BugReport();
        report.setTitle(body.get("title"));
        report.setDescription(body.get("description"));
        report.setStatus("pending");
        report.setUser(user);

        bugReportRepository.save(report);
        return ResponseEntity.ok(ApiResponse.success("Gửi báo cáo lỗi thành công! Cảm ơn bạn đã phản hồi."));
    }
}
