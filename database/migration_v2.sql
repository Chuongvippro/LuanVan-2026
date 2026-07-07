-- ============================================================
-- SCRIPT THÊM DỮ LIỆU MẪU (MOCK DATA) CHO JOB PLATFORM
-- Đảm bảo chạy lệnh này khi Spring Boot đã chạy và tự tạo xong các bảng
-- ============================================================

USE job_platform;

-- Xóa dữ liệu cũ (Tùy chọn, cẩn thận nếu đã có data thật)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE job_posts;
-- TRUNCATE TABLE job_categories;
-- TRUNCATE TABLE industries;
-- TRUNCATE TABLE candidates;
-- TRUNCATE TABLE recruiters;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 1. Dữ liệu mẫu cho Industries
INSERT IGNORE INTO industries (id, name, status) VALUES
(1, 'Công nghệ thông tin', 1),
(2, 'Tài chính - Ngân hàng', 1),
(3, 'Marketing - Truyền thông', 1),
(4, 'Giáo dục - Đào tạo', 1),
(5, 'Y tế - Dược phẩm', 1),
(6, 'Xây dựng - Bất động sản', 1),
(7, 'Sản xuất - Chế tạo', 1),
(8, 'Nhà hàng - Khách sạn', 1),
(9, 'Vận tải - Logistics', 1),
(10, 'Bán lẻ - Thương mại', 1);

-- 2. Dữ liệu mẫu cho Job Categories
INSERT IGNORE INTO job_categories (id, name, status, industry_id) VALUES
(1, 'Lập trình viên', 1, 1),
(2, 'Tester/QA', 1, 1),
(3, 'DevOps', 1, 1),
(4, 'Data Engineer', 1, 1),
(5, 'UI/UX Designer', 1, 1),
(6, 'Business Analyst', 1, 1),
(7, 'Project Manager', 1, 1),
(8, 'Kế toán', 1, 2),
(9, 'Nhân viên ngân hàng', 1, 2),
(10, 'Digital Marketing', 1, 3),
(11, 'Content Creator', 1, 3),
(12, 'Giáo viên', 1, 4),
(13, 'Dược sĩ', 1, 5),
(14, 'Kỹ sư xây dựng', 1, 6),
(15, 'Kỹ sư cơ khí', 1, 7);

-- 3. Dữ liệu mẫu cho Users (Password: 123456 mã hóa bằng BCrypt)
-- Hash BCrypt chuẩn của 123456: $2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e
INSERT IGNORE INTO users (id, name, email, password, role, status) VALUES
(1, 'Admin', 'admin@jobplatform.com', '$2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e', 'admin', 1),
(2, 'FPT HR', 'fptsoftware@recruiter.com', '$2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e', 'recruiter', 1),
(3, 'VNG HR', 'vng@recruiter.com', '$2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e', 'recruiter', 1),
(4, 'Ứng viên 1', 'ungvien1@candidate.com', '$2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e', 'candidate', 1);

-- 4. Dữ liệu mẫu cho Recruiters (Công ty)
INSERT IGNORE INTO recruiters (id, company_name, tax_code, company_email, website_url, logo, point, status_trust) VALUES
(2, 'FPT Software', '0101248141', 'hr@fptsoftware.com', 'https://fptsoftware.com', '/images/fpt_logo.png', 95, 'verified'),
(3, 'VNG Corporation', '0303625026', 'hr@vng.com.vn', 'https://vng.com.vn', '/images/vng_logo.png', 98, 'verified');

-- 5. Dữ liệu mẫu cho Candidates (Ứng viên)
INSERT IGNORE INTO candidates (id, phone, address, cv_path, skills) VALUES
(4, '0987654321', 'Quận 1, TP.HCM', NULL, 'Java, Spring Boot, ReactJS, SQL');

-- 6. Dữ liệu mẫu cho Job Posts (Bài đăng tuyển dụng)
INSERT IGNORE INTO job_posts (id, title, salary, location, job_type, experience_level, jd_text, requirements, benefits, status, recruiter_id, category_id) VALUES
(1, 'Senior Java Spring Boot Developer', '30,000,000 - 50,000,000 VNĐ', 'TP.HCM', 'full-time', 'senior', 'Phát triển các hệ thống backend quy mô lớn cho ngân hàng.', '- Tối thiểu 3 năm kinh nghiệm với Java/Spring Boot\n- Hiểu biết về Microservices, Kafka\n- Giao tiếp tiếng Anh tốt', '- Lương tháng 13\n- Bảo hiểm FPT Care\n- Môi trường làm việc quốc tế', 1, 2, 1),
(2, 'Chuyên viên ReactJS (Mid-level)', '15,000,000 - 25,000,000 VNĐ', 'TP.HCM', 'full-time', 'mid', 'Tham gia phát triển dự án web app quản trị cho đối tác Nhật Bản.', '- 2 năm kinh nghiệm ReactJS\n- Nắm vững Redux, Hooks\n- Ưu tiên biết tiếng Nhật', '- Review lương 2 lần/năm\n- Tham gia CLB công ty', 1, 2, 1),
(3, 'UI/UX Designer', 'Thỏa thuận', 'Hà Nội', 'full-time', 'mid', 'Thiết kế giao diện cho hệ sinh thái sản phẩm mới của VNG.', '- 2 năm kinh nghiệm Figma\n- Có portfolio tốt\n- Hiểu biết về UX/UI cho Mobile App', '- Laptop xịn sò\n- Cơm trưa miễn phí\n- Cổ phiếu thưởng', 1, 3, 5),
(4, 'Data Engineer Fresher', '10,000,000 - 15,000,000 VNĐ', 'Đà Nẵng', 'full-time', 'junior', 'Hỗ trợ xây dựng luồng xử lý dữ liệu Big Data.', '- Tốt nghiệp IT loại Khá trở lên\n- Biết Python/SQL', '- Được đào tạo bài bản', 1, 3, 4);
