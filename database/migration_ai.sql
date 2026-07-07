-- ============================================================
-- MIGRATION: Tạo bảng ai_conversations cho tính năng Trợ lý AI
-- Chạy script này trên database job_platform
-- ============================================================

USE job_platform;

CREATE TABLE IF NOT EXISTS ai_conversations (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT            NOT NULL,
    role          VARCHAR(20)    NOT NULL COMMENT 'user | assistant',
    content       LONGTEXT       NOT NULL,
    feature_context VARCHAR(50)  NULL     COMMENT 'evaluate_cv | find_jobs | interview_question | interview_answer | interview_evaluation | interview_ai_generated_answer',
    session_id    VARCHAR(100)   NULL     COMMENT 'UUID phiên phỏng vấn',
    created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_conv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ai_conv_user    (user_id),
    INDEX idx_ai_conv_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lưu lịch sử hội thoại với Trợ lý AI';
