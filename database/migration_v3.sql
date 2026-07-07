-- ============================================================
-- MIGRATION V3: Thêm job_code cho bài mẫu + Công ty mới + Bài đăng mới
-- Chạy sau khi đã chạy job_platform.sql và migration_v2.sql
-- ============================================================

USE job_platform;

-- ============================================================
-- BƯỚC 1: Cập nhật job_code cho 4 bài mẫu cũ (nếu chưa có)
-- ============================================================
UPDATE job_posts SET job_code = 'JP-FPT001' WHERE id = 1 AND (job_code IS NULL OR job_code = '');
UPDATE job_posts SET job_code = 'JP-FPT002' WHERE id = 2 AND (job_code IS NULL OR job_code = '');
UPDATE job_posts SET job_code = 'JP-VNG001' WHERE id = 3 AND (job_code IS NULL OR job_code = '');
UPDATE job_posts SET job_code = 'JP-VNG002' WHERE id = 4 AND (job_code IS NULL OR job_code = '');

-- ============================================================
-- BƯỚC 2: Thêm Users cho công ty mới
-- ============================================================
INSERT IGNORE INTO users (id, name, email, password, role, status) VALUES
(5,  'Vingroup HR',     'hr@vingroup.net',         '$2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e', 'recruiter', 1),
(6,  'Masan HR',        'hr@masangroup.com',        '$2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e', 'recruiter', 1),
(7,  'Vietcombank HR',  'hr@vietcombank.com.vn',   '$2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e', 'recruiter', 1),
(8,  'Grab Vietnam HR', 'hr@grab.com',              '$2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e', 'recruiter', 1),
(9,  'Ứng viên 2',      'ungvien2@candidate.com',  '$2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e', 'candidate', 1),
(10, 'Ứng viên 3',      'ungvien3@candidate.com',  '$2a$10$.B9xc2ZpPrzEZX.JsWm8Z.dIndfN.vLcxVqGH7YNnHxpRbKNY9E1e', 'candidate', 1);

-- ============================================================
-- BƯỚC 3: Thêm Công ty mới (Recruiters)
-- ============================================================
INSERT IGNORE INTO recruiters (id, company_name, tax_code, company_email, website_url, logo, point, status_trust) VALUES
(5, 'Vingroup',       '0101245678', 'hr@vingroup.net',       'https://vingroup.net',       '/images/vingroup_logo.png',    97, 'verified'),
(6, 'Masan Group',    '0303987654', 'hr@masangroup.com',     'https://masangroup.com',     '/images/masan_logo.png',       88, 'verified'),
(7, 'Vietcombank',    '0100112437', 'hr@vietcombank.com.vn', 'https://vietcombank.com.vn', '/images/vietcombank_logo.png', 96, 'verified'),
(8, 'Grab Vietnam',   '0314254263', 'hr@grab.com',           'https://grab.com/vn',        '/images/grab_logo.png',        92, 'verified');

-- ============================================================
-- BƯỚC 4: Thêm Candidates mẫu
-- ============================================================
INSERT IGNORE INTO candidates (id, phone, address, cv_path, skills) VALUES
(9,  '0912345678', 'Quận 3, TP.HCM', NULL, 'Kế toán, Tài chính, Excel, SAP'),
(10, '0987123456', 'Quận Bình Thạnh, TP.HCM', NULL, 'Marketing, SEO, Content Writing, Photoshop');

-- ============================================================
-- BƯỚC 5: Thêm bài đăng tuyển dụng đa dạng ngành nghề
-- (mỗi bài có job_code tĩnh để dễ test tính năng AI)
-- ============================================================
INSERT IGNORE INTO job_posts (id, job_code, title, salary, location, job_type, experience_level, jd_text, requirements, benefits, status, recruiter_id, category_id) VALUES

-- Vingroup — Bất động sản & Xây dựng
(5, 'JP-VIN001',
 'Kỹ sư Xây dựng Dân dụng',
 '18,000,000 - 30,000,000 VNĐ',
 'Hà Nội', 'full-time', 'mid',
 'Tham gia giám sát và triển khai các dự án bất động sản cao cấp của Vingroup trên toàn quốc.',
 '- Tốt nghiệp ngành Xây dựng Dân dụng & Công nghiệp\n- 2+ năm kinh nghiệm giám sát thi công\n- Biết đọc bản vẽ kỹ thuật, sử dụng AutoCAD\n- Chịu đi công tác',
 '- Lương cạnh tranh + thưởng dự án\n- Phụ cấp công tác\n- Bảo hiểm sức khỏe cao cấp Vinmec\n- Cơ hội thăng tiến nhanh',
 1, 5, 14),

(6, 'JP-VIN002',
 'Chuyên viên Kinh doanh Bất động sản',
 'Thỏa thuận + Hoa hồng hấp dẫn',
 'TP.HCM', 'full-time', 'junior',
 'Tư vấn và bán sản phẩm bất động sản thuộc hệ sinh thái Vinhomes.',
 '- Tốt nghiệp Đại học chuyên ngành Kinh tế/Kinh doanh\n- Kỹ năng giao tiếp và thuyết phục tốt\n- Năng động, chịu áp lực doanh số\n- Ưu tiên có kinh nghiệm BĐS',
 '- Hoa hồng không giới hạn\n- Đào tạo sales chuyên nghiệp\n- Team building hàng quý\n- Môi trường trẻ trung, năng động',
 1, 5, 10),

-- Masan Group — Sản xuất & Marketing
(7, 'JP-MSN001',
 'Chuyên viên Marketing (FMCG)',
 '15,000,000 - 22,000,000 VNĐ',
 'TP.HCM', 'full-time', 'mid',
 'Lên kế hoạch và triển khai các chiến dịch marketing cho nhãn hàng thực phẩm và đồ uống.',
 '- 2+ năm kinh nghiệm Brand Marketing trong FMCG\n- Nắm vững Trade Marketing và Consumer Insight\n- Kỹ năng phân tích dữ liệu thị trường\n- Tiếng Anh đọc hiểu tốt',
 '- Lương tháng 13 + bonus hiệu quả\n- Sản phẩm dùng thử miễn phí\n- Môi trường quốc tế\n- Đào tạo nội bộ liên tục',
 1, 6, 10),

(8, 'JP-MSN002',
 'Kỹ sư Cơ khí Sản xuất',
 '16,000,000 - 25,000,000 VNĐ',
 'Hà Nam', 'full-time', 'mid',
 'Vận hành, bảo trì máy móc thiết bị tại nhà máy sản xuất thực phẩm đóng gói.',
 '- Tốt nghiệp ngành Cơ khí/Cơ điện tử\n- Kinh nghiệm vận hành dây chuyền sản xuất tự động\n- Biết PLC, lập trình máy CNC là lợi thế\n- Chấp nhận làm ca',
 '- Phụ cấp ca đêm và ăn ca\n- Nhà ở tập thể (nếu cần)\n- Thưởng cuối năm theo KPI\n- BHXH đầy đủ',
 1, 6, 15),

-- Vietcombank — Tài chính - Ngân hàng
(9, 'JP-VCB001',
 'Chuyên viên Tín dụng Cá nhân',
 '14,000,000 - 20,000,000 VNĐ',
 'TP.HCM', 'full-time', 'junior',
 'Thẩm định và xử lý hồ sơ vay vốn cá nhân, cho vay mua nhà, xe và tiêu dùng.',
 '- Tốt nghiệp Tài chính - Ngân hàng, Kế toán\n- Hiểu biết về tín dụng tiêu dùng\n- Kỹ năng tư vấn, chăm sóc khách hàng\n- Ưu tiên có kinh nghiệm ngân hàng',
 '- Mức lương cố định + KPI\n- Thưởng tháng 13\n- Vay ưu đãi nhân viên\n- Môi trường chuyên nghiệp, ổn định',
 1, 7, 9),

(10, 'JP-VCB002',
 'Chuyên viên Phân tích Dữ liệu Ngân hàng',
 '20,000,000 - 35,000,000 VNĐ',
 'Hà Nội', 'full-time', 'mid',
 'Xây dựng báo cáo và mô hình phân tích tín dụng, rủi ro và hành vi khách hàng.',
 '- Tốt nghiệp Toán/Thống kê/CNTT\n- Thành thạo SQL, Python hoặc R\n- Kinh nghiệm xây dựng Dashboard (Power BI, Tableau)\n- 2+ năm trong lĩnh vực phân tích tài chính',
 '- Lương thưởng theo năng lực\n- Cổ phiếu ưu đãi nhân viên\n- Học bổng đào tạo chuyên sâu\n- Làm việc với dữ liệu lớn thực tế',
 1, 7, 4),

-- Grab Vietnam — Công nghệ & Vận hành
(11, 'JP-GRB001',
 'Backend Engineer (Go/Java)',
 '25,000,000 - 45,000,000 VNĐ',
 'TP.HCM', 'full-time', 'mid',
 'Xây dựng và vận hành các hệ thống backend phục vụ hàng triệu chuyến xe mỗi ngày.',
 '- 3+ năm kinh nghiệm Backend (Go, Java, hoặc Kotlin)\n- Hiểu biết về Microservices, Kafka, Redis\n- Kinh nghiệm với hệ thống distributed\n- Tiếng Anh giao tiếp tốt',
 '- Lương cạnh tranh theo thị trường quốc tế\n- Stock options\n- Budget học tập $500/năm\n- Hybrid remote 2 ngày/tuần',
 1, 8, 1),

(12, 'JP-GRB002',
 'Operations & Logistics Analyst',
 '12,000,000 - 18,000,000 VNĐ',
 'TP.HCM', 'full-time', 'junior',
 'Phân tích và tối ưu hóa hoạt động vận tải, giao hàng của GrabFood và GrabExpress.',
 '- Tốt nghiệp Logistics, Quản trị, hoặc Kinh tế\n- Thành thạo Excel, Google Sheets\n- Kỹ năng phân tích số liệu tốt\n- Ưu tiên biết SQL cơ bản',
 '- Tài khoản Grab miễn phí\n- Bảo hiểm sức khỏe\n- Môi trường quốc tế, năng động\n- Teamwork & hackathon định kỳ',
 1, 8, 9);
