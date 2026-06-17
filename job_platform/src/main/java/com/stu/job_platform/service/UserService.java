package com.stu.job_platform.service;

import com.stu.job_platform.dto.RegisterRequest;
import com.stu.job_platform.entity.User;
import com.stu.job_platform.entity.Candidate;
import com.stu.job_platform.entity.Recruiter;
import com.stu.job_platform.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.mindrot.jbcrypt.BCrypt;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
        String hashPasword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt(12)); 
        user.setPassword(hashPasword); 
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
            
            // Lấy dữ liệu riêng của Recruiter từ DTO (Đã bỏ taxCode và websiteUrl)
            recruiter.setCompanyName(request.getCompanyName());
            
            // Nếu không nhập email công ty riêng, lấy luôn email gốc làm email công ty
            String compEmail = request.getCompanyEmail();
            recruiter.setCompanyEmail(compEmail != null && !compEmail.isEmpty() ? compEmail : request.getEmail());
            
            // -------------------------------------------------------------
            // 🛡️ LUỒNG TÍNH ĐIỂM UY TÍN CHỐNG SPAM DOANH NGHIỆP GIẢ DANH
            // -------------------------------------------------------------
            int initialPoint = 0;

            // Đăng ký thành công tài khoản: +30 điểm
            initialPoint += 30;

            // Có điền tên công ty: +10 điểm
            if (request.getCompanyName() != null && !request.getCompanyName().trim().isEmpty()) {
                initialPoint += 10;
            }

            // Gọi hàm kiểm tra xem email công ty có phải hàng chính chủ doanh nghiệp không: +20 điểm
            if (isCompanyEmail(recruiter.getCompanyEmail())) {
                initialPoint += 20; 
            }

            recruiter.setPoint(initialPoint); // Gán tổng điểm tính được vào biến point
            // -------------------------------------------------------------
            
            recruiter.setStatusTrust("pending"); // Mặc định chờ duyệt
            
            entityManager.persist(recruiter); // Ép lệnh INSERT lưu vô DB bảng con
        } else if (!"admin".equalsIgnoreCase(savedUser.getRole())) {
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