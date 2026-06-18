package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ProfileRequest;
import com.stu.job_platform.entity.*;
import com.stu.job_platform.repository.*;
import com.stu.job_platform.service.AiVerificationService;
import com.fasterxml.jackson.databind.ObjectMapper; // ◄ Thêm thằng này để bóc JSON chuẩn 100%
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    @Autowired private UserRepository userRepository;
    @Autowired private CandidateRepository candidateRepository;
    @Autowired private RecruiterRepository recruiterRepository;
    @Autowired private AiVerificationService aiVerificationService;
    
    // Khai báo bộ chuyển đổi JSON của Jackson
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. Hàm lấy thông tin hồ sơ đổ lên giao diện (Giữ nguyên bản xịn)
    @GetMapping("/{userId}/{role}")
    public ResponseEntity<?> getProfile(@PathVariable Integer userId, @PathVariable String role) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Tài khoản không tồn tại!");

        ProfileRequest dto = new ProfileRequest();
        dto.setEmail(user.getEmail());
        dto.setName(user.getName()); 
        dto.setRole(user.getRole());

        if ("recruiter".equals(role)) {
            Recruiter rec = recruiterRepository.findById(userId).orElse(new Recruiter());
            dto.setCompanyName(rec.getCompanyName());
            dto.setCompanyEmail(rec.getCompanyEmail());
            dto.setTaxCode(rec.getTaxCode());
            dto.setWebsiteUrl(rec.getWebsiteUrl());
            dto.setStatus(rec.getStatusTrust() != null ? rec.getStatusTrust() : "pending");
        } else {
            Candidate can = candidateRepository.findById(userId).orElse(new Candidate());
            dto.setPhone(can.getPhone());
            dto.setAddress(can.getAddress());
            dto.setStatus(user.getStatus() != null ? user.getStatus().toString() : "1");
        }
        return ResponseEntity.ok(dto);
    }

    // 2. Hàm cập nhật chữ thô (Mất focus ô nhập): Tự động gỡ tích xanh trường bị sửa đổi
    @PutMapping("/{userId}/{role}")
    public ResponseEntity<?> updateProfile(@PathVariable Integer userId, @PathVariable String role, @RequestBody ProfileRequest dto) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Tài khoản không tồn tại!");

        user.setName(dto.getName()); 
        userRepository.save(user);

        if ("recruiter".equals(role)) {
            Recruiter rec = recruiterRepository.findById(userId).orElse(new Recruiter());
            rec.setId(userId);
            
            String currentStatus = rec.getStatusTrust();
            if (currentStatus == null || "pending".equals(currentStatus) || "verified".equals(currentStatus)) currentStatus = "";
            Set<String> verifiedFields = new HashSet<>(Arrays.asList(currentStatus.split(",")));
            verifiedFields.remove("");

            if (rec.getCompanyName() != null && !rec.getCompanyName().equals(dto.getCompanyName())) verifiedFields.remove("name");
            if (rec.getTaxCode() != null && !rec.getTaxCode().equals(dto.getTaxCode())) verifiedFields.remove("tax");
            if (rec.getWebsiteUrl() != null && !rec.getWebsiteUrl().equals(dto.getWebsiteUrl())) verifiedFields.remove("website");

            rec.setCompanyName(dto.getCompanyName());
            rec.setCompanyEmail(dto.getCompanyEmail());
            rec.setTaxCode(dto.getTaxCode());
            rec.setWebsiteUrl(dto.getWebsiteUrl());
            
            if (verifiedFields.isEmpty()) {
                rec.setStatusTrust("pending");
            } else {
                rec.setStatusTrust(String.join(",", verifiedFields));
            }

            int extra = 0;
            if (verifiedFields.contains("name")) extra += 10;
            if (verifiedFields.contains("tax")) extra += 20;
            if (verifiedFields.contains("website")) extra += 10;
            rec.setPoint(60 + extra);
            
            recruiterRepository.save(rec);
        } else {
            Candidate can = candidateRepository.findById(userId).orElse(new Candidate());
            can.setId(userId);
            can.setPhone(dto.getPhone());
            can.setAddress(dto.getAddress());
            candidateRepository.save(can);
        }
        return ResponseEntity.ok("Đã lưu thay đổi thành công!");
    }

    // 3. ◄ HÀM DUYỆT TỪNG Ô ĐỘC LẬP ĐÃ NÂNG CẤP BÓC TÁCH MAP SỐ CHUẨN 100%
    @PostMapping("/verify-field/{userId}")
public ResponseEntity<?> verifyField(@PathVariable Integer userId, @RequestBody Map<String, String> request) {
    Recruiter rec = recruiterRepository.findById(userId).orElse(null);
    if (rec == null) return ResponseEntity.badRequest().body("Hồ sơ không tồn tại!");

    String fieldType = request.get("fieldType");
    String value = request.get("value");

    // ◄ 1. LỚP VALIDATE CỨNG & ĐIỀU KIỆN
    if ("taxCode".equals(fieldType)) {
        if (value.length() != 10 && value.length() != 13) {
            return ResponseEntity.ok(Map.of("status", "FAILED", "reason", "MST phải đúng 10 hoặc 13 số!"));
        }
        if (rec.getCompanyName() == null || rec.getCompanyName().isEmpty()) {
            return ResponseEntity.ok(Map.of("status", "FAILED", "reason", "Hãy duyệt Tên trước!"));
        }
    }

    if ("websiteUrl".equals(fieldType)) {
        String val = value.toLowerCase();
        if (val.contains("zalo.me") || val.contains("facebook.com") || val.contains("linkedin.com")) {
            return ResponseEntity.ok(Map.of("status", "FAILED", "reason", "Không chấp nhận mạng xã hội!"));
        }
        if (rec.getCompanyName() == null || rec.getTaxCode() == null) {
            return ResponseEntity.ok(Map.of("status", "FAILED", "reason", "Hãy duyệt Tên và Mã thuế trước!"));
        }
    }

    // ◄ 2. LỚP GỌI AI
    try {
        String inputForAi = "websiteUrl".equals(fieldType) ? aiVerificationService.scrapeWebsiteText(value) : value;
        String aiRawJson = aiVerificationService.verifyFieldWithAi(fieldType, inputForAi, rec, rec.getCompanyEmail());

        // Bóc tách JSON sạch
        String cleanJson = aiRawJson.trim();
        int firstBrace = cleanJson.indexOf("{");
        int lastBrace = cleanJson.lastIndexOf("}");
        cleanJson = (firstBrace != -1 && lastBrace != -1) ? cleanJson.substring(firstBrace, lastBrace + 1) : "{\"match_percentage\": 0}";

        Map<String, Object> aiMap = objectMapper.readValue(cleanJson, Map.class);
        int matchPercentage = Integer.parseInt(aiMap.getOrDefault("match_percentage", 0).toString());

        // ◄ 3. LỚP CẬP NHẬT TRẠNG THÁI (Ngưỡng 90)
        Set<String> verifiedFields = new HashSet<>(Arrays.asList((rec.getStatusTrust() == null ? "" : rec.getStatusTrust()).split(",")));
        verifiedFields.remove("");

        if (matchPercentage >= 90) {
            if ("companyName".equals(fieldType)) verifiedFields.add("name");
            else if ("taxCode".equals(fieldType)) verifiedFields.add("tax");
            else if ("websiteUrl".equals(fieldType)) verifiedFields.add("website");

            rec.setStatusTrust(String.join(",", verifiedFields));
            rec.setPoint(60 + (verifiedFields.contains("name")?10:0) + (verifiedFields.contains("tax")?20:0) + (verifiedFields.contains("website")?10:0));
            recruiterRepository.save(rec);
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "newStatus", rec.getStatusTrust(), "newPoint", rec.getPoint()));
        } else {
            // Gỡ tích xanh nếu AI báo điểm thấp
            if ("companyName".equals(fieldType)) verifiedFields.remove("name");
            else if ("taxCode".equals(fieldType)) verifiedFields.remove("tax");
            else if ("websiteUrl".equals(fieldType)) verifiedFields.remove("website");
            
            rec.setStatusTrust(String.join(",", verifiedFields));
            rec.setPoint(60 + (verifiedFields.contains("name")?10:0) + (verifiedFields.contains("tax")?20:0) + (verifiedFields.contains("website")?10:0));
            recruiterRepository.save(rec);
            return ResponseEntity.ok(Map.of("status", "FAILED", "reason", aiMap.getOrDefault("reason", "Thông tin không khớp!")));
        }
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.ok(Map.of("status", "FAILED", "reason", "Lỗi AI!"));
    }
}
}