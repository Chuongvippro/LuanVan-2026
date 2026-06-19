package com.stu.job_platform.service;

import com.stu.job_platform.dto.RegisterRequest;
import com.stu.job_platform.entity.User;
import com.stu.job_platform.entity.Candidate;
import com.stu.job_platform.entity.Recruiter;
import com.stu.job_platform.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.mindrot.jbcrypt.BCrypt;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Sử dụng PasswordEncoder của Spring Security để mã hóa mật khẩu  

    @PersistenceContext
    private EntityManager entityManager; 

    @Transactional // Đảm bảo tính toàn vẹn, lỗi bất cứ bảng con nào là hủy sạch bảng user gốc
    public String registerUser(RegisterRequest request) {
        // 1. Kiểm tra trùng email tài khoản gốc
        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email này đã được sử dụng!";
        }

        // 2. Đổ dữ liệu chung vào đối tượng User gốc
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        
        // Mã hóa mật khẩu bằng BCrypt với 12 vòng lặp (vừa bảo mật vừa ghi điểm luận văn)
        String hashPassword = passwordEncoder.encode(request.getPassword()); 
        user.setPassword(hashPassword); 
        user.setRole(request.getRole().toLowerCase());
        user.setStatus(1); 

        // 3. Lưu bảng Users trước để lấy ID tự tăng (Identity) về lập tức
        User savedUser = userRepository.save(user);
        userRepository.flush(); 

        // 4. Dựa vào vai trò để bóc dữ liệu trong DTO nạp vào bảng con độc lập
        if ("candidate".equalsIgnoreCase(savedUser.getRole())) {
            Candidate candidate = new Candidate();
            candidate.setUser(savedUser);       // Gắn mối quan hệ khóa ngoại
            candidate.setId(savedUser.getId()); // Gắn ID của User làm khóa chính bảng con
            
            // Lấy dữ liệu riêng của Candidate từ DTO
            candidate.setPhone(request.getPhone());
            candidate.setAddress(request.getAddress());
            candidate.setCvPath(null);
            candidate.setSkills(null);
            
            entityManager.persist(candidate); // Ép lệnh INSERT mới tinh xuống DB
            
        } else if ("recruiter".equalsIgnoreCase(savedUser.getRole())) {
            Recruiter recruiter = new Recruiter();
            recruiter.setUser(savedUser);       
            recruiter.setId(savedUser.getId()); 
            
            // Nhận Tên công ty từ DTO gửi lên
            recruiter.setCompanyName(request.getCompanyName() != null && !request.getCompanyName().isEmpty() 
                    ? request.getCompanyName() : null);
            
            // Các trường doanh nghiệp còn lại để cập nhật sau ở Profile
            recruiter.setTaxCode(null);
            recruiter.setWebsiteUrl(null);
            
            // Xử lý Email công ty
            String compEmail = request.getCompanyEmail();
            recruiter.setCompanyEmail(compEmail != null && !compEmail.isEmpty() ? compEmail : request.getEmail());
            
            // --- LUỒNG TÍNH ĐIỂM UY TÍN ---
            int initialPoint = 30; // Đăng ký thành công: +30 điểm
            if (isCompanyEmail(recruiter.getCompanyEmail())) {
                initialPoint += 20; // Đuôi mail công ty chính chủ: +20 điểm
            }
            recruiter.setPoint(initialPoint);
            
            recruiter.setStatusTrust("pending"); 
            entityManager.persist(recruiter); 
        }else if (!"admin".equalsIgnoreCase(savedUser.getRole())) {
            return "Vai trò không hợp lệ!";
        }

        return "Đăng ký tài khoản thành công!";
    }

    /**
     * Hàm Helper kiểm tra xem Email có phải thuộc Doanh nghiệp hay không
     * Bằng cách lọc bỏ các Domain mail cá nhân công cộng miễn phí
     */
    private boolean isCompanyEmail(String email) {
        if (email == null || !email.contains("@")) return false;
        
        // Cắt lấy cái đuôi domain sau chữ @
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase().trim();
        
        // Danh sách các đuôi email cá nhân/công cộng phổ biến
        String[] publicDomains = {
            "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", 
            "live.com", "icloud.com", "mail.ru", "yandex.com"
        };
        
        // Nếu trùng với đám này thì KHÔNG PHẢI email doanh nghiệp (Dùng mail cá nhân rác)
        for (String publicDomain : publicDomains) {
            if (domain.equals(publicDomain)) {
                return false; 
            }
        }
        return true; // Là email có domain riêng của công ty
    }
}