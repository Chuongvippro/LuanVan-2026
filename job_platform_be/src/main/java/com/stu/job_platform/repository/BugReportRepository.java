package com.stu.job_platform.repository;

import com.stu.job_platform.entity.BugReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BugReportRepository extends JpaRepository<BugReport, Integer> {
    List<BugReport> findByStatus(String status);
    List<BugReport> findByUserId(Integer userId);
    List<BugReport> findAllByOrderByCreatedAtDesc();
}
