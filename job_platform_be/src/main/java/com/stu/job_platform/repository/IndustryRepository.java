package com.stu.job_platform.repository;

import com.stu.job_platform.entity.Industry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IndustryRepository extends JpaRepository<Industry, Integer> {
    List<Industry> findByStatus(Integer status);
}
