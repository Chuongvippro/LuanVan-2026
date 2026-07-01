package com.stu.job_platform.service;

import com.stu.job_platform.dto.JobPostRequest;
import com.stu.job_platform.dto.JobPostResponse;
import com.stu.job_platform.entity.JobCategory;
import com.stu.job_platform.entity.JobPost;
import com.stu.job_platform.entity.Recruiter;
import com.stu.job_platform.repository.ApplicationRepository;
import com.stu.job_platform.repository.JobCategoryRepository;
import com.stu.job_platform.repository.JobPostRepository;
import com.stu.job_platform.repository.RecruiterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class JobPostService {

    @Autowired
    private JobPostRepository jobPostRepository;
    @Autowired
    private RecruiterRepository recruiterRepository;
    @Autowired
    private JobCategoryRepository jobCategoryRepository;
    @Autowired
    private ApplicationRepository applicationRepository;

    private static final String CHARACTERS =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private String generateJobCode() {

        Random random = new Random();

        String code;

        do {

            StringBuilder builder = new StringBuilder("JP-");

            for (int i = 0; i < 6; i++) {
                builder.append(
                        CHARACTERS.charAt(
                                random.nextInt(CHARACTERS.length())
                        )
                );
            }

            code = builder.toString();

        } while (jobPostRepository.existsByJobCode(code));

        return code;
    }

    /**
     * Tạo bài đăng mới (Recruiter)
     */
    public JobPostResponse createJobPost(Integer recruiterId, JobPostRequest request) {
        Recruiter recruiter = recruiterRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Nhà tuyển dụng không tồn tại!"));

        JobPost jobPost = new JobPost();
        jobPost.setTitle(request.getTitle());
        jobPost.setSalary(request.getSalary());
        jobPost.setLocation(request.getLocation());
        jobPost.setJobType(request.getJobType());
        jobPost.setExperienceLevel(request.getExperienceLevel());
        jobPost.setJdText(request.getJdText());
        jobPost.setRequirements(request.getRequirements());
        jobPost.setBenefits(request.getBenefits());
        jobPost.setStatus(1); // Active mặc định
        jobPost.setJobCode(generateJobCode());
        jobPost.setRecruiter(recruiter);

        if (request.getCategoryId() != null) {
            JobCategory category = jobCategoryRepository.findById(request.getCategoryId()).orElse(null);
            jobPost.setJobCategory(category);
        }

        JobPost saved = jobPostRepository.save(jobPost);
        return toResponse(saved);
    }

    /**
     * Cập nhật bài đăng (Recruiter chỉ sửa được bài của mình)
     */
    public JobPostResponse updateJobPost(Integer jobId, Integer recruiterId, JobPostRequest request) {
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Bài đăng không tồn tại!"));

        if (!jobPost.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Bạn không có quyền sửa bài đăng này!");
        }

        jobPost.setTitle(request.getTitle());
        jobPost.setSalary(request.getSalary());
        jobPost.setLocation(request.getLocation());
        jobPost.setJobType(request.getJobType());
        jobPost.setExperienceLevel(request.getExperienceLevel());
        jobPost.setJdText(request.getJdText());
        jobPost.setRequirements(request.getRequirements());
        jobPost.setBenefits(request.getBenefits());

        if (request.getCategoryId() != null) {
            JobCategory category = jobCategoryRepository.findById(request.getCategoryId()).orElse(null);
            jobPost.setJobCategory(category);
        }

        JobPost saved = jobPostRepository.save(jobPost);
        return toResponse(saved);
    }

    /**
     * Xóa bài đăng (soft delete: đổi status = -1)
     */
    public void deleteJobPost(Integer jobId, Integer recruiterId) {
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Bài đăng không tồn tại!"));

        if (!jobPost.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Bạn không có quyền xóa bài đăng này!");
        }

        jobPost.setStatus(-1); // Soft delete
        jobPostRepository.save(jobPost);
    }

    /**
     * Lấy chi tiết 1 bài đăng
     */
    public JobPostResponse getJobPost(Integer jobId) {
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Bài đăng không tồn tại!"));
        return toResponse(jobPost);
    }

    /**
     * Lấy danh sách bài đăng active (cho trang chủ)
     */
    public Page<JobPostResponse> getActiveJobs(Pageable pageable) {
        return jobPostRepository.findByStatus(1, pageable).map(this::toResponse);
    }

    /**
     * Tìm kiếm nâng cao
     */
    public Page<JobPostResponse> searchJobs(String keyword, Integer categoryId,
                                             String location, String jobType, Pageable pageable) {
        return jobPostRepository.searchJobs(keyword, categoryId, location, jobType, pageable)
                .map(this::toResponse);
    }

    /**
     * Lấy bài đăng của Recruiter (quản lý bài đăng cá nhân)
     */
    public List<JobPostResponse> getJobsByRecruiter(Integer recruiterId) {
        return jobPostRepository.findByRecruiterId(recruiterId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy bài đăng nổi bật (10 bài mới nhất)
     */
    public List<JobPostResponse> getFeaturedJobs() {
        return jobPostRepository.findTop10ByStatusOrderByCreatedAtDesc(1).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Admin: Lấy tất cả bài đăng
     */
    public Page<JobPostResponse> getAllJobsAdmin(Pageable pageable) {
        return jobPostRepository.findAll(pageable).map(this::toResponse);
    }

    /**
     * Admin: Ẩn/Hiện bài đăng
     */
    public void toggleJobStatus(Integer jobId, Integer status) {
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Bài đăng không tồn tại!"));
        jobPost.setStatus(status);
        jobPostRepository.save(jobPost);
    }

    // ===== Helper: Chuyển Entity → Response DTO =====
    private JobPostResponse toResponse(JobPost jobPost) {
        JobPostResponse dto = new JobPostResponse();
        dto.setId(jobPost.getId());
        dto.setTitle(jobPost.getTitle());
        dto.setSalary(jobPost.getSalary());
        dto.setLocation(jobPost.getLocation());
        dto.setJobType(jobPost.getJobType());
        dto.setExperienceLevel(jobPost.getExperienceLevel());
        dto.setJdText(jobPost.getJdText());
        dto.setRequirements(jobPost.getRequirements());
        dto.setBenefits(jobPost.getBenefits());
        dto.setStatus(jobPost.getStatus());
        dto.setCreatedAt(jobPost.getCreatedAt());
        dto.setJobCode(jobPost.getJobCode());

        // Gom thông tin recruiter
        if (jobPost.getRecruiter() != null) {
            dto.setRecruiterId(jobPost.getRecruiter().getId());
            dto.setCompanyName(jobPost.getRecruiter().getCompanyName());
            dto.setCompanyLogo(jobPost.getRecruiter().getLogo());
            dto.setCompanyPoint(jobPost.getRecruiter().getPoint());
        }

        // Gom thông tin category
        if (jobPost.getJobCategory() != null) {
            dto.setCategoryId(jobPost.getJobCategory().getId());
            dto.setCategoryName(jobPost.getJobCategory().getName());
        }

        // Đếm số ứng tuyển
        dto.setApplicationCount(applicationRepository.countByJobPostId(jobPost.getId()));

        return dto;
    }
}
