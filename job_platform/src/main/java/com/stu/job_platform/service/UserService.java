package com.stu.job_platform.service;

import com.stu.job_platform.entity.User;
import com.stu.job_platform.entity.Candidate;
import com.stu.job_platform.entity.Recruiter;
import com.stu.job_platform.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager; // ◄ Tiêm bộ quản lý thực thể trực tiếp của JPA vào đây

    @Transactional // Đảm bảo tính toàn vẹn dữ liệu, lỗi là rollback sạch
    public String registerUser(User user) {
        // 1. Kiểm tra trùng email
        if (userRepository.existsByEmail(user.getEmail())) {
            return "Email này đã được sử dụng rồi mày ơi!";
        }

        // 2. Set trạng thái hoạt động mặc định
        user.setStatus(1); 

        // 3. Lưu bảng Users trước để SQL Server sinh ra cái ID tự tăng (Identity)
        User savedUser = userRepository.save(user);
        userRepository.flush(); // Ép ghi xuống DB để lấy ID về lập tức

        // 4. Kiểm tra vai trò để lưu vào bảng tương ứng độc lập bằng lệnh PERSIST
        if ("candidate".equalsIgnoreCase(savedUser.getRole())) {
            Candidate candidate = new Candidate();
            candidate.setUser(savedUser);       // Gắn quan hệ khóa ngoại sang bảng users
            candidate.setId(savedUser.getId()); // Gắn ID của User làm khóa chính bảng con
            
            entityManager.persist(candidate); // ◄ ÉP LỆNH INSERT MỚI TINH, KHÔNG CHO CHẠY SELECT CHECK LÚ NỮA!
            
        } else if ("recruiter".equalsIgnoreCase(savedUser.getRole())) {
            Recruiter recruiter = new Recruiter();
            recruiter.setUser(savedUser);       // Gắn quan hệ
            recruiter.setId(savedUser.getId()); // Gắn ID làm khóa chính
            
            entityManager.persist(recruiter); // ◄ ÉP LỆNH INSERT MỚI TINH
        } else if (!"admin".equalsIgnoreCase(savedUser.getRole())) {
            return "Vai trò không hợp lệ mày ơi!";
        }

        return "Đăng ký tài khoản thành công!";
    }
}