package com.stu.job_platform.controller;

import com.stu.job_platform.dto.ApiResponse;
import com.stu.job_platform.entity.AiConversation;
import com.stu.job_platform.service.AiChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller cho Widget Trợ lý AI
 */
@RestController
@RequestMapping("/api/v1/ai")
public class AiChatController {

    @Autowired
    private AiChatService aiChatService;

    /**
     * Gửi tin nhắn chat
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<String>> chat(
            Authentication auth, @RequestBody Map<String, String> body) {
        Integer userId = (Integer) auth.getPrincipal();
        String message = body.get("message");
        String context = body.getOrDefault("context", "general");

        String response = aiChatService.chat(userId, message, context);
        return ResponseEntity.ok(ApiResponse.success("OK", response));
    }

    /**
     * Lấy lịch sử chat
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AiConversation>>> getChatHistory(Authentication auth) {
        Integer userId = (Integer) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(aiChatService.getChatHistory(userId)));
    }

    /**
     * Xóa lịch sử chat
     */
    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<?>> clearHistory(Authentication auth) {
        Integer userId = (Integer) auth.getPrincipal();
        aiChatService.clearChatHistory(userId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa lịch sử chat!"));
    }
}
