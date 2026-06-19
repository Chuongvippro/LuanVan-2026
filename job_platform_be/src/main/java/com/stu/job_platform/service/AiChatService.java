package com.stu.job_platform.service;

import com.stu.job_platform.entity.AiConversation;
import com.stu.job_platform.entity.User;
import com.stu.job_platform.repository.AiConversationRepository;
import com.stu.job_platform.repository.UserRepository;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý tương tác AI Chatbot (Trợ lý tìm việc)
 * Hỗ trợ: tìm việc bằng ngôn ngữ tự nhiên, tóm tắt CV, gợi ý JD
 */
@Service
public class AiChatService {

    private final String apiKey;

    @Autowired
    private AiConversationRepository aiConversationRepository;
    @Autowired
    private UserRepository userRepository;

    public AiChatService() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String key = dotenv.get("GROQ_API_KEY");
        if (key == null) key = dotenv.get("GEMINI_API_KEY");
        if (key == null) {
            dotenv = Dotenv.configure().directory("./job_platform").ignoreIfMissing().load();
            key = dotenv.get("GROQ_API_KEY");
            if (key == null) key = dotenv.get("GEMINI_API_KEY");
        }
        this.apiKey = key;
    }

    /**
     * Xử lý tin nhắn chat từ user
     */
    public String chat(Integer userId, String userMessage, String featureContext) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));

        // Lưu tin nhắn user vào DB
        AiConversation userMsg = new AiConversation();
        userMsg.setUser(user);
        userMsg.setRole("user");
        userMsg.setContent(userMessage);
        userMsg.setFeatureContext(featureContext);
        aiConversationRepository.save(userMsg);

        // Lấy lịch sử hội thoại (tối đa 10 tin nhắn gần nhất)
        List<AiConversation> history = aiConversationRepository.findByUserIdOrderByCreatedAtAsc(userId);
        List<AiConversation> recentHistory = history.size() > 10
                ? history.subList(history.size() - 10, history.size())
                : history;

        // Tạo system prompt tùy theo role
        String systemPrompt = buildSystemPrompt(user.getRole(), featureContext);

        // Gọi API AI
        String aiResponse = callAiApi(systemPrompt, recentHistory);

        // Lưu phản hồi AI vào DB
        AiConversation aiMsg = new AiConversation();
        aiMsg.setUser(user);
        aiMsg.setRole("assistant");
        aiMsg.setContent(aiResponse);
        aiMsg.setFeatureContext(featureContext);
        aiConversationRepository.save(aiMsg);

        return aiResponse;
    }

    /**
     * Lấy lịch sử hội thoại
     */
    public List<AiConversation> getChatHistory(Integer userId) {
        return aiConversationRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    /**
     * Xóa lịch sử hội thoại
     */
    public void clearChatHistory(Integer userId) {
        aiConversationRepository.deleteByUserId(userId);
    }

    // ===== PRIVATE HELPERS =====

    private String buildSystemPrompt(String role, String context) {
        String base = "Bạn là trợ lý AI thông minh trên nền tảng tuyển dụng Job Platform. " +
                "Hãy trả lời bằng tiếng Việt, ngắn gọn, chuyên nghiệp và thân thiện. ";

        if ("candidate".equals(role)) {
            base += "Người dùng là Ứng viên đang tìm việc. Bạn có thể giúp họ: " +
                    "1) Tìm kiếm việc làm phù hợp, 2) Tư vấn CV, 3) Gợi ý cách trả lời phỏng vấn, " +
                    "4) Phân tích mức lương thị trường. " +
                    "Nếu họ yêu cầu tìm việc, hãy hỏi rõ: vị trí, địa điểm, mức lương mong muốn.";
        } else if ("recruiter".equals(role)) {
            base += "Người dùng là Nhà tuyển dụng. Bạn có thể giúp họ: " +
                    "1) Viết mô tả công việc (JD) chuyên nghiệp, 2) Tóm tắt và đánh giá CV ứng viên, " +
                    "3) Gợi ý câu hỏi phỏng vấn, 4) Tư vấn mức lương cạnh tranh cho vị trí tuyển.";
        }

        return base;
    }

    private String callAiApi(String systemPrompt, List<AiConversation> history) {
        String apiUrl = "https://api.groq.com/openai/v1/chat/completions";

        // Xây dựng danh sách messages theo format OpenAI
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        for (AiConversation msg : history) {
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", messages,
                "temperature", 0.7,
                "max_tokens", 1024
        );

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            Map<?, ?> responseBody = response.getBody();
            List<?> choices = (List<?>) responseBody.get("choices");
            Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
            return message.get("content").toString().trim();
        } catch (Exception e) {
            e.printStackTrace();
            return "Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau!";
        }
    }
}
