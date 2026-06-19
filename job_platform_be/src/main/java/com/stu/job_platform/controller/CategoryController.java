package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.entity.Industry;
import com.stu.job_platform.entity.JobCategory;
import com.stu.job_platform.repository.IndustryRepository;
import com.stu.job_platform.repository.JobCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller public cho danh mục ngành nghề (dùng cho bộ lọc front-end)
 */
@RestController
@RequestMapping("/api/v1")
public class CategoryController {

    @Autowired
    private IndustryRepository industryRepository;
    @Autowired
    private JobCategoryRepository jobCategoryRepository;

    /**
     * Lấy tất cả ngành nghề
     */
    @GetMapping("/industries")
    public ResponseEntity<ApiResponse<List<Industry>>> getAllIndustries() {
        return ResponseEntity.ok(ApiResponse.success(industryRepository.findByStatus(1)));
    }

    /**
     * Lấy tất cả danh mục việc làm
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<JobCategory>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(jobCategoryRepository.findByStatus(1)));
    }

    /**
     * Lấy danh mục theo ngành
     */
    @GetMapping("/categories/industry/{industryId}")
    public ResponseEntity<ApiResponse<List<JobCategory>>> getCategoriesByIndustry(@PathVariable Integer industryId) {
        return ResponseEntity.ok(ApiResponse.success(jobCategoryRepository.findByIndustryId(industryId)));
    }
}
