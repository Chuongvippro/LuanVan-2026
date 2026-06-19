package com.stu.job_platform.service;

import com.stu.job_platform.entity.Application;
import com.stu.job_platform.entity.Candidate;
import com.stu.job_platform.entity.JobPost;
import com.stu.job_platform.repository.ApplicationRepository;
import com.stu.job_platform.repository.CandidateRepository;
import com.stu.job_platform.repository.JobPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private CandidateRepository candidateRepository;
    @Autowired
    private JobPostRepository jobPostRepository;

    /**
     * Ứng viên nộp đơn ứng tuyển vào bài đăng
     */
    public Application applyToJob(Integer candidateId, Integer jobPostId, String cvPath, String coverLetter) {
        // Kiểm tra đã ứng tuyển chưa
        if (applicationRepository.existsByCandidateIdAndJobPostId(candidateId, jobPostId)) {
            throw new RuntimeException("Bạn đã ứng tuyển vào vị trí này rồi!");
        }

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Ứng viên không tồn tại!"));

        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new RuntimeException("Bài đăng không tồn tại!"));

        if (jobPost.getStatus() != 1) {
            throw new RuntimeException("Bài đăng này đã ngừng tuyển!");
        }

        Application application = new Application();
        application.setCandidate(candidate);
        application.setJobPost(jobPost);
        application.setCvPath(cvPath);
        application.setCoverLetter(coverLetter);
        application.setStatus(0); // 0: pending
        application.setMatchPercentage(null); // AI sẽ tính sau

        return applicationRepository.save(application);
    }

    /**
     * Lấy danh sách ứng viên cho 1 bài đăng (Recruiter xem)
     */
    public List<Application> getApplicationsByJobPost(Integer jobPostId) {
        return applicationRepository.findByJobPostId(jobPostId);
    }

    /**
     * Lấy lịch sử ứng tuyển của Candidate
     */
    public List<Application> getApplicationsByCandidate(Integer candidateId) {
        return applicationRepository.findByCandidateId(candidateId);
    }

    /**
     * Recruiter duyệt/từ chối đơn ứng tuyển
     */
    public Application updateApplicationStatus(Integer applicationId, Integer recruiterId, Integer status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Đơn ứng tuyển không tồn tại!"));

        // Kiểm tra bài đăng có thuộc recruiter này không
        if (!application.getJobPost().getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Bạn không có quyền xử lý đơn này!");
        }

        application.setStatus(status); // 1: accepted, -1: rejected
        return applicationRepository.save(application);
    }
}
