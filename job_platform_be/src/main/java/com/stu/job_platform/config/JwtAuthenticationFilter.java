package com.stu.job_platform.config;

import com.stu.job_platform.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT Authentication Filter
 * Chạy trước mọi request, tự động bóc tách và xác thực JWT Token từ Header Authorization
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Lấy header Authorization từ request
        String authHeader = request.getHeader("Authorization");

        // 2. Nếu không có hoặc không bắt đầu bằng "Bearer " thì bỏ qua, cho đi tiếp
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Cắt bỏ "Bearer " lấy chuỗi token thuần
        String token = authHeader.substring(7);

        try {
            // 4. Xác thực token có hợp lệ không
            if (jwtUtil.isTokenValid(token)) {
                String email = jwtUtil.getEmailFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);
                Integer userId = jwtUtil.getUserIdFromToken(token);

                // 5. Tạo đối tượng Authentication với role là ROLE_CANDIDATE / ROLE_RECRUITER / ROLE_ADMIN
                List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())
                );

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);

                // 6. Đặt vào SecurityContext để Spring Security nhận diện user đã xác thực
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // Token lỗi hoặc hết hạn => bỏ qua, không set authentication
            SecurityContextHolder.clearContext();
        }

        // 7. Cho request đi tiếp vào Controller
        filterChain.doFilter(request, response);
    }
}
