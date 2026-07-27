package com.stu.job_platform.repository;

import com.stu.job_platform.entity.Recruiter;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;;

@Repository
public interface RecruiterRepository extends JpaRepository<Recruiter, Integer> {
    List<Recruiter> findByPointAndStatusTrust(Integer point, String statusTrust);
}