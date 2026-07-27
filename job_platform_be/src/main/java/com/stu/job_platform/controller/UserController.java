package com.stu.job_platform.controller;

import com.stu.job_platform.dto.RecruiterTrustResponse;
import com.stu.job_platform.dto.RegisterRequest;
import com.stu.job_platform.entity.Recruiter;
import com.stu.job_platform.service.UserService;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    // Bước 1: nhận form đăng ký -> tạo OTP tài khoản -> gửi mail
    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }

    // Bước 2: xác thực OTP tài khoản -> tạo user thật trong DB
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam String email, @RequestParam String otp) {
        return userService.verifyOtp(email, otp);
    }

    // Xác thực email công ty (riêng, bắt buộc trước khi bấm "Đăng ký" với role recruiter)
    @PostMapping("/company-email/send-otp")
    public String sendCompanyEmailOtp(@RequestParam String companyEmail) {
        return userService.sendCompanyEmailOtp(companyEmail);
    }

    @PostMapping("/company-email/verify-otp")
    public String verifyCompanyEmailOtp(@RequestParam String companyEmail, @RequestParam String otp) {
        return userService.verifyCompanyEmailOtp(companyEmail, otp);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        //TODO: process POST request
        
        return userService.forgotPassword(email);
    }
    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String email, @RequestParam String otp, @RequestParam String newPassword) {
        //TODO: process POST request
        
        return userService.resetPassword(email, otp, newPassword);
    }
    


    @GetMapping("/recruiters/trusted")
    public ResponseEntity<?> getTrustedRecruiters() {
        List<RecruiterTrustResponse> trustedList = userService.getTrustedRecruiters();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", trustedList);
        return ResponseEntity.ok(response);
    }
    
}