package com.stu.job_platform.repository;

import com.stu.job_platform.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Integer> {

    // Lấy danh sách ứng tuyển theo bài đăng (Recruiter xem ứng viên)
    List<Application> findByJobPostId(Integer jobPostId);

    // Lấy danh sách ứng tuyển của candidate (Candidate xem lịch sử)
    List<Application> findByCandidateId(Integer candidateId);

    // Kiểm tra đã ứng tuyển chưa (tránh trùng)
    boolean existsByCandidateIdAndJobPostId(Integer candidateId, Integer jobPostId);

    // Đếm số lượt ứng tuyển cho 1 bài đăng
    long countByJobPostId(Integer jobPostId);
}
