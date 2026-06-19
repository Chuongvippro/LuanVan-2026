package com.stu.job_platform.service;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.dto.JobPostResponse;
import com.stu.job_platform.entity.ErrorLog;
import com.stu.job_platform.entity.User;
import com.stu.job_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AdminService {

    @Autowired private UserRepository userRepository;
    @Autowired private JobPostRepository jobPostRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private ErrorLogRepository errorLogRepository;
    @Autowired private CandidateRepository candidateRepository;
    @Autowired private RecruiterRepository recruiterRepository;
    @Autowired private JobPostService jobPostService;

    // ===== USERS =====

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Map<String, Object>> getCandidates() {
        // Lấy tất cả candidates 1 lần, tránh N+1
        List<User> candidates = userRepository.findByRoleIgnoreCase("candidate");

        // Load toàn bộ candidate profiles 1 lần
        Map<Integer, com.stu.job_platform.entity.Candidate> profileMap = new HashMap<>();
        candidateRepository.findAll().forEach(c -> profileMap.put(c.getId(), c));

        return candidates.stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("status", u.getStatus());

            var profile = profileMap.get(u.getId());
            if (profile != null) {
                map.put("phone", profile.getPhone());
                map.put("address", profile.getAddress());
                map.put("cvPath", profile.getCvPath());
            } else {
                map.put("phone", "Chưa cập nhật");
                map.put("address", "Chưa cập nhật");
                map.put("cvPath", null);
            }
            return map;
        }).toList();
    }

    public List<Map<String, Object>> getRecruiters() {
        List<User> recruiters = userRepository.findByRoleIgnoreCase("recruiter");

        // Load toàn bộ recruiter profiles 1 lần
        Map<Integer, com.stu.job_platform.entity.Recruiter> profileMap = new HashMap<>();
        recruiterRepository.findAll().forEach(r -> profileMap.put(r.getId(), r));

        return recruiters.stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("status", u.getStatus());

            var profile = profileMap.get(u.getId());
            if (profile != null) {
                map.put("companyName", profile.getCompanyName());
                map.put("taxCode", profile.getTaxCode());
                map.put("companyEmail", profile.getCompanyEmail());
                map.put("websiteUrl", profile.getWebsiteUrl());
                map.put("logo", profile.getLogo());
                map.put("statusTrust", profile.getStatusTrust());
            } else {
                map.put("companyName", "Chưa tạo hồ sơ DN");
                map.put("taxCode", "N/A");
                map.put("statusTrust", null);
            }
            return map;
        }).toList();
    }

    public void toggleUserStatus(Integer userId, Integer status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));
        user.setStatus(status);
        userRepository.save(user);
    }

    public void deleteUser(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Tài khoản không tồn tại!");
        }
        userRepository.deleteById(userId);
    }

    // ===== JOBS =====

    public Page<JobPostResponse> getAllJobs(Pageable pageable) {
        return jobPostService.getAllJobsAdmin(pageable);
    }

    public void toggleJobStatus(Integer jobId, Integer status) {
        jobPostService.toggleJobStatus(jobId, status);
    }

    // ===== ERROR LOGS =====

    public List<ErrorLog> getAllErrorLogs() {
        List<ErrorLog> logs = new ArrayList<>(errorLogRepository.findAll());
        Collections.reverse(logs);
        return logs;
    }

    public void updateErrorLogStatus(Integer id, String status) {
        ErrorLog log = errorLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhật ký lỗi không tồn tại!"));
        log.setStatus(status);
        errorLogRepository.save(log);
    }

    // ===== STATS =====

    public Map<String, Object> getStats() {
        long pendingBugs = errorLogRepository.findAll().stream()
                .filter(log -> "pending".equalsIgnoreCase(log.getStatus()))
                .count();

        return Map.of(
                "totalUsers", userRepository.count(),
                "totalJobs", jobPostRepository.count(),
                "totalApplications", applicationRepository.count(),
                "pendingBugs", pendingBugs
        );
    }
}