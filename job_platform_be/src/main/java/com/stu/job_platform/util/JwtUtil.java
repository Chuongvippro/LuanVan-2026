package com.stu.job_platform.util;

import com.stu.job_platform.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final Key key;
    private final long accessTokenExpiry;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiry}") long accessTokenExpiry) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenExpiry = accessTokenExpiry;
    }

    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("name", user.getName());
        claims.put("role", user.getRole());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiry))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Giải mã và xác thực JWT Token, trả về Claims nếu hợp lệ
     */
    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Kiểm tra token còn hạn hay không
     */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Lấy email (subject) từ token
     */
    public String getEmailFromToken(String token) {
        return parseToken(token).getSubject();
    }

    /**
     * Lấy userId từ token
     */
    public Integer getUserIdFromToken(String token) {
        return parseToken(token).get("id", Integer.class);
    }

    /**
     * Lấy role từ token
     */
    public String getRoleFromToken(String token) {
        return parseToken(token).get("role", String.class);
    }
}