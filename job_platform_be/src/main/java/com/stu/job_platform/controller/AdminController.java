package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.dto.JobPostResponse;
import com.stu.job_platform.dto.UpdateCandidateRequest;
import com.stu.job_platform.dto.UpdateRecruiterRequest;
import com.stu.job_platform.entity.BugReport;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;





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

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<?>> updateUser(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        //TODO: process PUT request
        
        String role = adminService.getRoleById(id);
        if("candidate".equalsIgnoreCase(role)) {
            UpdateCandidateRequest request = new UpdateCandidateRequest();
            request.setName((String) body.get("name"));
            request.setEmail((String) body.get("email"));
            
            adminService.updateCandidate(id, request);
        }else if("recruiter".equalsIgnoreCase(role)) {
            // Handle recruiter update logic here
            // You can create a similar DTO for recruiter updates if needed
            UpdateRecruiterRequest  request = new UpdateRecruiterRequest();
            request.setName((String) body.get("name"));
            request.setEmail((String) body.get("email"));
            request.setCompanyName((String) body.get("companyName"));
            request.setTaxCode((String) body.get("taxCode"));
            request.setWebsiteUrl((String) body.get("websiteUrl"));
            request.setVerifiedName((Boolean) body.get("verifiedName"));
            request.setVerifiedTax((Boolean) body.get("verifiedTax"));
            request.setVerifiedWebsite((Boolean) body.get("verifiedWebsite"));
            adminService.updateRecruiter(id, request);
        } 
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin người dùng thành công!"));
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

    @GetMapping("/bugs")
    public ResponseEntity<ApiResponse<List<BugReport>>> getAllBugs() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllBugReports()));
    }

   @PutMapping("/bugs/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateBugStatus(
            @PathVariable Integer id, @RequestBody Map<String, String> body) {
        adminService.updateBugStatus(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công!"));
    }

    // ===== STATS =====

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats()));
    }

    // ===== INDUSTRIES & JOB CATEGORIES =====
    @GetMapping("/industries")
    public ResponseEntity<ApiResponse<?>>   getAllIndustry(){
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllIndustries()));
    }

    @PostMapping("/industries")
    public ResponseEntity<ApiResponse<?>> addIndustry(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        adminService.addIndustry(name);
        return ResponseEntity.ok(ApiResponse.success("Thêm ngành nghề thành công!"));
    }
    @PutMapping("/industries/{id}")
    public ResponseEntity<ApiResponse<?>> updateIndustry(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        Integer status = (Integer) body.get("status");
        adminService.updateIndustry(id, name, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ngành nghề thành công!"));
    }
    @DeleteMapping("/industries/{id}")
    public ResponseEntity<ApiResponse<?>> deleteIndustry(@PathVariable Integer id) {
        adminService.deleteIndustry(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa ngành nghề thành công!"));
    }


    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<?>> getAllJobCategories() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllJobCategories()));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<?>> addJobCategory(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        Integer industryId = (Integer) body.get("industryId");
        adminService.addJobCategory(name, industryId);
        return ResponseEntity.ok(ApiResponse.success("Thêm danh mục việc làm thành công!"));
    }
    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<?>> updateJobCategory(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        adminService.updateJobCategory(id, name);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục việc làm thành công!"));
    }
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<?>> deleteJobCategory(@PathVariable Integer id) {
        adminService.deleteJobCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa danh mục việc làm thành công!"));
    }
    
}