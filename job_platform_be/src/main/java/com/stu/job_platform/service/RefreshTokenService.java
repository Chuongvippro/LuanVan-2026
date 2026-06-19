package com.stu.job_platform.service;

import com.stu.job_platform.entity.RefreshToken;
import com.stu.job_platform.entity.User;
import com.stu.job_platform.repository.RefreshTokenRepository;
import com.stu.job_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    // Thời gian sống của Refresh Token: 5 ngày (Đổi sang giây)
    private final long REFRESH_TOKEN_EXPIRY_SECONDS = 5 * 24 * 60 * 60;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Tạo Refresh Token mới tinh cho User và lưu xuống DB
     */
    @Transactional
    public RefreshToken createRefreshToken(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID!"));

        // Xóa sạch các token cũ của user này dưới DB trước khi cấp cái mới (Tránh rác DB)
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString()); // Tạo chuỗi ngẫu nhiên không trùng lặp
        refreshToken.setExpiryDate(Instant.now().plusSeconds(REFRESH_TOKEN_EXPIRY_SECONDS)); // Hạn 5 ngày từ lúc tạo

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Kiểm tra xem cục Refresh Token gửi lên từ React có bị quá hạn 5 ngày chưa
     */
    public RefreshToken verifyExpiration(RefreshToken token) {
        // So sánh thời gian hết hạn của token với thời gian hiện tại
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token); // Quá hạn là xóa thẳng tay dưới DB luôn
            throw new RuntimeException("Refresh Token này hết hạn 5 ngày rồi! Đăng xuất thôi.");
        }
        return token;
    }

    /**
     * Tìm cục token thô dưới DB
     */
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }
}