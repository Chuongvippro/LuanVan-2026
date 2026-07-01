package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.service.AiChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AiChatController {

    @Autowired
    private AiChatService aiChatService;

    /** Đánh giá CV bằng file upload mới */
    @PostMapping("/evaluate-cv-file")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<String>> evaluateCvFile(
            @RequestParam("cv") MultipartFile cvFile,
            @RequestParam("jobCode") String jobCode) {
        try {
            return ResponseEntity.ok(ApiResponse.success("OK", aiChatService.evaluateWithFile(cvFile, jobCode)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi đánh giá CV: " + e.getMessage()));
        }
    }

    /** Đánh giá CV bằng CV có sẵn trong hồ sơ */
    @PostMapping("/evaluate-cv")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<String>> evaluateCvProfile(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(ApiResponse.success("OK",
                    aiChatService.evaluateWithProfileCv((Integer) auth.getPrincipal(), body.get("jobCode"))));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi đánh giá CV: " + e.getMessage()));
        }
    }

    /** Tìm bài đăng tuyển dụng phù hợp với CV */
    @PostMapping("/find-matching-jobs")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<String>> findMatchingJobs(
            @RequestParam("cv") MultipartFile cvFile) {
        try {
            return ResponseEntity.ok(ApiResponse.success("OK", aiChatService.findMatchingJobs(cvFile)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi tìm việc phù hợp: " + e.getMessage()));
        }
    }

    /**
     * PHỎNG VẤN THỬ — Bước 1: Upload CV → AI sinh câu hỏi
     * POST /api/v1/ai/interview/start
     * Body: multipart/form-data { cv: file }
     * Response: { question: string, sessionId: string }
     */
    @PostMapping("/interview/start")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Map<String, String>>> interviewStart(
            Authentication auth,
            @RequestParam("cv") MultipartFile cvFile) {
        try {
            Map<String, String> result = aiChatService.startInterview((Integer) auth.getPrincipal(), cvFile);
            return ResponseEntity.ok(ApiResponse.success("OK", result));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi tạo câu hỏi: " + e.getMessage()));
        }
    }

    /**
     * PHỎNG VẤN THỬ — Bước 2: Gửi câu trả lời → kiểm tra chủ đề → đánh giá
     * POST /api/v1/ai/interview/answer
     * Body: { sessionId, question, answer }
     * Response on-topic:  { status: "ON_TOPIC",  evaluation: string }
     * Response off-topic: { status: "OFF_TOPIC", reason: string }
     */
    @PostMapping("/interview/answer")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Map<String, String>>> interviewAnswer(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        try {
            String sessionId = body.get("sessionId");
            String question  = body.get("question");
            String answer    = body.get("answer");

            if (answer == null || answer.isBlank())
                return ResponseEntity.badRequest().body(ApiResponse.error("Câu trả lời không được để trống!"));

            Map<String, String> result = aiChatService.submitAnswer(
                    (Integer) auth.getPrincipal(), sessionId, question, answer);
            return ResponseEntity.ok(ApiResponse.success("OK", result));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi xử lý câu trả lời: " + e.getMessage()));
        }
    }

    /**
     * PHỎNG VẤN THỬ — AI tự sinh câu trả lời khi ứng viên không biết
     * POST /api/v1/ai/interview/generate-answer
     * Body: { sessionId, question }
     * Response: { answer: string }
     */
    @PostMapping("/interview/generate-answer")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateAnswer(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        try {
            String sessionId = body.get("sessionId");
            String question  = body.get("question");

            if (question == null || question.isBlank())
                return ResponseEntity.badRequest().body(ApiResponse.error("Thiếu câu hỏi!"));

            Map<String, String> result = aiChatService.generateAnswerForUser(
                    (Integer) auth.getPrincipal(), sessionId, question);
            return ResponseEntity.ok(ApiResponse.success("OK", result));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi tạo câu trả lời: " + e.getMessage()));
        }
    }
}