package com.stu.job_platform.repository;

import com.stu.job_platform.entity.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, Integer> {
    List<JobCategory> findByIndustryId(Integer industryId);
    List<JobCategory> findByStatus(Integer status);
}
