package com.stu.job_platform.repository;

import com.stu.job_platform.entity.RefreshToken;
import com.stu.job_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    
    // Tìm cục token dưới DB xem có tồn tại không
    Optional<RefreshToken> findByToken(String token);
    
    // Xóa token cũ của User khi họ đăng nhập mới hoặc đăng xuất
    void deleteByUser(User user);
}