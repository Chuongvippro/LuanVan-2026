package com.stu.job_platform.util;

import com.stu.job_platform.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    // Chuỗi bí mật dùng để ký mã hóa JWT (Phải dài trên 32 ký tự)
    private final String SECRET_KEY = "ChuyenDeTotNghiepCongNghePhanMemSTU2026";
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // Thời gian sống của Access Token: 7 phút (7 * 60 * 100000 miligiây)
    private final long ACCESS_TOKEN_EXPIRY = 7 * 60 * 1000;

    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("name", user.getName());
        claims.put("role", user.getRole());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRY))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}