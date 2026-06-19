package com.stu.job_platform.repository;

import com.stu.job_platform.entity.ErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, Integer> {
    List<ErrorLog> findByUserId(Integer userId);
}