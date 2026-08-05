package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.dto.UserSettingsRequest;
import com.stu.job_platform.entity.UserSettings;
import com.stu.job_platform.service.UserSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    @Autowired
    private UserSettingsService settingsService;

    /**
     * GET /api/v1/settings/{userId}
     * Lấy toàn bộ cài đặt tài khoản
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getSettings(@PathVariable Integer userId) {
        try {
            UserSettings settings = settingsService.getSettings(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy cài đặt thành công", toMap(settings)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * PUT /api/v1/settings/{userId}/notifications
     * Cập nhật cài đặt thông báo
     */
    @PutMapping("/{userId}/notifications")
    public ResponseEntity<?> updateNotifications(@PathVariable Integer userId,
                                                  @RequestBody UserSettingsRequest req) {
        try {
            UserSettings updated = settingsService.updateNotifications(userId, req);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đã lưu cài đặt thông báo!", toMap(updated)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * PUT /api/v1/settings/{userId}/appearance
     * Cập nhật cài đặt giao diện
     */
    @PutMapping("/{userId}/appearance")
    public ResponseEntity<?> updateAppearance(@PathVariable Integer userId,
                                               @RequestBody UserSettingsRequest req) {
        try {
            UserSettings updated = settingsService.updateAppearance(userId, req);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đã lưu cài đặt giao diện!", toMap(updated)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * PUT /api/v1/settings/{userId}
     * Cập nhật toàn bộ settings cùng lúc
     */
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateAll(@PathVariable Integer userId,
                                        @RequestBody UserSettingsRequest req) {
        try {
            UserSettings updated = settingsService.updateAll(userId, req);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đã lưu tất cả cài đặt!", toMap(updated)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Helper: chuyển Entity sang Map để trả về JSON gọn gàng (không kèm user object lồng nhau)
     */
    private Map<String, Object> toMap(UserSettings s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("userId", s.getUserId());

        // Notifications
        map.put("emailNewJob", s.getEmailNewJob());
        map.put("emailApplication", s.getEmailApplication());
        map.put("emailNewsletter", s.getEmailNewsletter());
        map.put("browserPush", s.getBrowserPush());

        // Appearance
        map.put("fontSize", s.getFontSize());
        map.put("language", s.getLanguage());
        map.put("theme", s.getTheme());

        return map;
    }
}
