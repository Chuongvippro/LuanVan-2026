package com.stu.job_platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service xử lý upload file (CV, Logo, Avatar, Screenshot)
 * File được lưu local tại thư mục ./uploads/
 */
@Service
public class FileUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * Upload file và trả về đường dẫn tương đối
     * @param file File được upload từ form
     * @param subFolder Thư mục con (cv, logo, avatar, screenshots)
     * @return Đường dẫn tương đối: /uploads/cv/uuid_filename.pdf
     */
    public String uploadFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File không được để trống!");
        }

        // Validate file type
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("Tên file không hợp lệ!");
        }

        // Tạo tên file duy nhất tránh trùng
        String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;

        try {
            // Tạo thư mục nếu chưa tồn tại
            Path uploadPath = Paths.get(uploadDir, subFolder);
            Files.createDirectories(uploadPath);

            // Lưu file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Trả về đường dẫn tương đối
            return "/uploads/" + subFolder + "/" + uniqueFilename;

        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi upload file: " + e.getMessage());
        }
    }

    /**
     * Xóa file theo đường dẫn
     */
    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) return;
        try {
            // Chuyển đường dẫn tương đối thành tuyệt đối
            String relativePath = filePath.replace("/uploads/", "");
            Path path = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Log nhưng không throw vì xóa file không critical
            System.err.println("Không thể xóa file: " + filePath);
        }
    }
}
