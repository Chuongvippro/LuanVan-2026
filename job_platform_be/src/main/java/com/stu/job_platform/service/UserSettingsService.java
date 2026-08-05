package com.stu.job_platform.service;

import com.stu.job_platform.dto.UserSettingsRequest;
import com.stu.job_platform.entity.User;
import com.stu.job_platform.entity.UserSettings;
import com.stu.job_platform.repository.UserRepository;
import com.stu.job_platform.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserSettingsService {

    @Autowired
    private UserSettingsRepository settingsRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy settings của user. Nếu chưa có thì tạo mới với giá trị mặc định.
     */
    public UserSettings getSettings(Integer userId) {
        return settingsRepository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại!"));

            UserSettings defaults = new UserSettings();
            defaults.setUser(user);
            defaults.setEmailNewJob(true);
            defaults.setEmailApplication(true);
            defaults.setEmailNewsletter(false);
            defaults.setBrowserPush(true);
            defaults.setFontSize("normal");
            defaults.setLanguage("vi");
            defaults.setTheme("red");
            return settingsRepository.save(defaults);
        });
    }

    /**
     * Cập nhật thông báo preferences
     */
    public UserSettings updateNotifications(Integer userId, UserSettingsRequest req) {
        UserSettings settings = getSettings(userId);

        if (req.getEmailNewJob() != null) settings.setEmailNewJob(req.getEmailNewJob());
        if (req.getEmailApplication() != null) settings.setEmailApplication(req.getEmailApplication());
        if (req.getEmailNewsletter() != null) settings.setEmailNewsletter(req.getEmailNewsletter());
        if (req.getBrowserPush() != null) settings.setBrowserPush(req.getBrowserPush());

        return settingsRepository.save(settings);
    }

    /**
     * Cập nhật giao diện preferences
     */
    public UserSettings updateAppearance(Integer userId, UserSettingsRequest req) {
        UserSettings settings = getSettings(userId);

        if (req.getFontSize() != null) settings.setFontSize(req.getFontSize());
        if (req.getLanguage() != null) settings.setLanguage(req.getLanguage());
        if (req.getTheme() != null) settings.setTheme(req.getTheme());

        return settingsRepository.save(settings);
    }

    /**
     * Cập nhật tất cả settings cùng lúc
     */
    public UserSettings updateAll(Integer userId, UserSettingsRequest req) {
        UserSettings settings = getSettings(userId);

        // Notifications
        if (req.getEmailNewJob() != null) settings.setEmailNewJob(req.getEmailNewJob());
        if (req.getEmailApplication() != null) settings.setEmailApplication(req.getEmailApplication());
        if (req.getEmailNewsletter() != null) settings.setEmailNewsletter(req.getEmailNewsletter());
        if (req.getBrowserPush() != null) settings.setBrowserPush(req.getBrowserPush());

        // Appearance
        if (req.getFontSize() != null) settings.setFontSize(req.getFontSize());
        if (req.getLanguage() != null) settings.setLanguage(req.getLanguage());
        if (req.getTheme() != null) settings.setTheme(req.getTheme());

        return settingsRepository.save(settings);
    }
}
