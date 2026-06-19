package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.entity.Recruiter;
import com.stu.job_platform.repository.RecruiterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/companies")
public class CompanyController {

    @Autowired
    private RecruiterRepository recruiterRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Recruiter>>> getAllCompanies() {
        // Lấy tất cả recruiter có tên công ty
        List<Recruiter> companies = recruiterRepository.findAll().stream()
                .filter(r -> r.getCompanyName() != null && !r.getCompanyName().isEmpty())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(companies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Recruiter>> getCompanyDetail(@PathVariable Integer id) {
        Recruiter company = recruiterRepository.findById(id).orElse(null);
        if (company == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không tìm thấy công ty"));
        }
        return ResponseEntity.ok(ApiResponse.success(company));
    }
}
