package com.stu.job_platform.service;

import com.stu.job_platform.entity.BugReport;
import com.stu.job_platform.entity.User;
import com.stu.job_platform.repository.BugReportRepository;
import com.stu.job_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class BugReportService {

    @Autowired
    private BugReportRepository bugReportRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FileUploadService fileUploadService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_IMG_EXT = List.of(".png", ".jpg", ".jpeg", ".webp");
    private static final long MAX_SIZE = 5 * 1024 * 1024;

    public void submitReport(Authentication auth, String title, String description, MultipartFile screenshot) throws IOException {
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập mô tả lỗi!");
        }

        Integer userId = (Integer) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));

        BugReport report = new BugReport();
        report.setTitle(title);
        report.setDescription(description);
        report.setStatus("pending");
        report.setUser(user);

        if (screenshot != null && !screenshot.isEmpty()) {
            String path = fileUploadService.uploadFile(screenshot, "bug"); // khớp với FileController: /bug/{fileName}
            report.setScreenshotPath(path);
        }

        bugReportRepository.save(report);
    }

    private String saveScreenshot(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new IllegalArgumentException("Tên file ảnh không hợp lệ!");
        }
        String ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
        if (!ALLOWED_IMG_EXT.contains(ext)) {
            throw new IllegalArgumentException("Chỉ chấp nhận ảnh PNG, JPG, JPEG hoặc WEBP!");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("Ảnh vượt quá 5MB!");
        }

        Path dirPath = Paths.get(uploadDir, "bug");
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        String fileName = "bug_" + UUID.randomUUID() + ext;
        file.transferTo(dirPath.resolve(fileName).toFile());

        return fileName;
    }
}