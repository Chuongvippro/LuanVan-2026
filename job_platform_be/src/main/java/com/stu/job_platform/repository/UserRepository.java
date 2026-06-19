package com.stu.job_platform.repository;

import com.stu.job_platform.entity.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    User findByEmail(String email);

    List<User> findByRoleIgnoreCase(String role);
}