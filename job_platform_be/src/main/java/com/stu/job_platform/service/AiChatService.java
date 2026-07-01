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
import com.stu.job_platform.entity.Candidate;
import com.stu.job_platform.entity.JobPost;
import com.stu.job_platform.repository.CandidateRepository;
import com.stu.job_platform.repository.JobPostRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import com.stu.job_platform.entity.AiConversation;
import com.stu.job_platform.repository.AiConversationRepository;

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
    private JobPostRepository jobPostRepository;

    @Autowired
    private CandidateRepository candidateRepository;

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

    // ── Endpoint 1: Upload file mới ──
    public String evaluateWithFile(MultipartFile cvFile, String jobCode) throws IOException {
        String cvText = extractTextFromMultipart(cvFile);
        return evaluate(cvText, jobCode);
    }

    // ── Endpoint 2: Dùng CV profile sẵn ──
    public String evaluateWithProfileCv(Integer candidateId, String jobCode) throws IOException {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên!"));

        String cvPath = candidate.getCvPath();
        if (cvPath == null) throw new RuntimeException("Bạn chưa có CV trong hồ sơ!");

        File file = new File(cvPath);
        String cvText = cvPath.endsWith(".pdf")
                ? extractTextFromPdf(file)
                : extractTextFromDocx(file);

        return evaluate(cvText, jobCode);
    }

    // ── Gọi Groq AI ──
    private String evaluate(String cvText, String jobCode) {
        JobPost job = jobPostRepository.findByJobCode(jobCode)
                .orElseThrow(() -> new RuntimeException("Mã bài đăng không tồn tại!"));

        String prompt = """
            Bạn là chuyên gia tuyển dụng.

            Hãy đánh giá CV với bài tuyển dụng dưới đây.

            === BÀI TUYỂN DỤNG ===
            Vị trí: %s
            Mô tả: %s
            Yêu cầu: %s

            === CV ===
            %s

            Chỉ trả lời bằng tiếng Việt.

            BẮT BUỘC trả lời đúng định dạng sau, không giải thích dài dòng:

            🎯 Điểm phù hợp: XX/100

            ✅ Điểm mạnh:
            - ...
            - ...

            ❌ Còn thiếu:
            - ...
            - ...

            💡 Gợi ý:
            - ...
            - ...

            Quy tắc:
            - Tổng độ dài dưới 120 từ.
            - Mỗi mục tối đa 2 gạch đầu dòng.
            - Không mở đầu bằng "Tôi sẽ đánh giá..."
            - Không viết đoạn văn.
            - Nếu CV rất phù hợp vẫn phải nêu ít nhất 1 điểm cần cải thiện.
            - Giữa các mục phải có dòng trống.
            - Không thêm bất kỳ thông tin nào ngoài các mục trên.
            """.formatted(
                job.getTitle(),
                job.getJdText(),
                job.getRequirements(),
                cvText
            );
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "system", "content", "Bạn là chuyên gia tuyển dụng, trả lời bằng tiếng Việt, rõ ràng và chuyên nghiệp."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.3,
                "max_tokens", 1024
        );

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions", entity, Map.class);

            List<?> choices = (List<?>) response.getBody().get("choices");
            Map<?, ?> message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
            return message.get("content").toString().trim();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi gọi AI. Vui lòng thử lại!");
        }
    }

    // ── Extract text ──
    private String extractTextFromMultipart(MultipartFile file) throws IOException {
        String name = file.getOriginalFilename();
        if (name == null) throw new RuntimeException("File không hợp lệ!");
        if (name.endsWith(".pdf")) {
            try (PDDocument doc = PDDocument.load(file.getInputStream())) {
                return new PDFTextStripper().getText(doc);
            }
        } else if (name.endsWith(".docx")) {
            try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
                return new XWPFWordExtractor(doc).getText();
            }
        }
        throw new RuntimeException("Chỉ hỗ trợ PDF và DOCX!");
    }

    private String extractTextFromPdf(File file) throws IOException {
        try (PDDocument doc = PDDocument.load(file)) {
            return new PDFTextStripper().getText(doc);
        }
    }

    private String extractTextFromDocx(File file) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(new FileInputStream(file))) {
            return new XWPFWordExtractor(doc).getText();
        }
    }


    // ── Tìm job phù hợp với CV ──
    public String findMatchingJobs(MultipartFile cvFile) throws IOException {
        String cvText = extractTextFromMultipart(cvFile);

        List<JobPost> activeJobs = jobPostRepository.findByStatus(1);
        if (activeJobs.isEmpty()) {
            return "[]";
        }

        // Gom danh sách job thành text ngắn gọn để AI dễ đối chiếu
        StringBuilder jobListText = new StringBuilder();
        for (JobPost job : activeJobs) {
            jobListText.append(String.format(
                "- Mã: %s | Vị trí: %s | Mô tả: %s | Yêu cầu: %s\n",
                job.getJobCode(),
                job.getTitle(),
                truncate(job.getJdText(), 200),
                truncate(job.getRequirements(), 200)
            ));
        }

        String prompt = """
            Bạn là hệ thống gợi ý việc làm. Dưới đây là nội dung CV của ứng viên và danh sách các bài tuyển dụng đang mở.

            === NỘI DUNG CV ===
            %s

            === DANH SÁCH BÀI TUYỂN DỤNG ===
            %s

            YÊU CẦU:
            Chọn ra các mã bài đăng (jobCode) phù hợp nhất với CV này (tối đa 5 mã, chỉ chọn nếu thực sự phù hợp về kỹ năng/kinh nghiệm).
            Nếu không có bài nào phù hợp, trả về mảng rỗng.

            CHỈ trả về JSON thuần, không giải thích, đúng định dạng:
            ["JP-XXXXXX", "JP-YYYYYY"]
            """.formatted(cvText, jobListText.toString());

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "system", "content", "Bạn chỉ trả về JSON thuần, không thêm bất kỳ text giải thích nào."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.2,
                "max_tokens", 512
        );

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions", entity, Map.class);

            List<?> choices = (List<?>) response.getBody().get("choices");
            Map<?, ?> message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
            String content = message.get("content").toString().trim();

            // Đôi khi AI trả kèm ```json ... ``` nên cần lọc ra
            content = content.replaceAll("```json", "").replaceAll("```", "").trim();
            return content;

        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() > maxLen ? text.substring(0, maxLen) + "..." : text;
    }


    // ═══════════════════════════════════════════════════════════════
// THÊM VÀO CUỐI AiChatService.java (trước dấu } cuối cùng)
// ═══════════════════════════════════════════════════════════════


    // ── PHỎNG VẤN THỬ: Bước 1 ───────────────────────────────────────────────
    public Map<String, String> startInterview(Integer userId, MultipartFile cvFile) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        String cvText = extractTextFromMultipart(cvFile);
        if (cvText.isBlank()) throw new RuntimeException("Không đọc được nội dung CV!");

        String prompt = """
            Bạn là chuyên gia phỏng vấn tuyển dụng.
            Dưới đây là nội dung CV của ứng viên:

            === CV ===
            %s

            Hãy đặt đúng 1 câu hỏi phỏng vấn cụ thể dựa trên kỹ năng hoặc kinh nghiệm trong CV này.
            Câu hỏi phải bằng tiếng Việt, ngắn gọn (1–2 câu).
            CHỈ trả về câu hỏi, không thêm bất kỳ text nào khác.
            """.formatted(cvText);

        String question = callGroq(
            "Bạn là chuyên gia phỏng vấn, chỉ trả về câu hỏi phỏng vấn bằng tiếng Việt.",
            prompt, 0.7, 256
        );

        String sessionId = UUID.randomUUID().toString();
        saveConversation(user, "assistant", question, "interview_question", sessionId);

        return Map.of("question", question, "sessionId", sessionId);
    }

    // ── PHỎNG VẤN THỬ: Bước 2 ───────────────────────────────────────────────
    public Map<String, String> submitAnswer(Integer userId, String sessionId, String question, String answer) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        // 2a: Check on-topic trước (tiết kiệm token)
        String checkPrompt = """
            Câu hỏi phỏng vấn: %s
            Câu trả lời của ứng viên: %s

            Kiểm tra xem câu trả lời có liên quan đến câu hỏi phỏng vấn không.
            Lạc đề nếu: spam, hỏi ngược, nội dung vô nghĩa, hoàn toàn không liên quan.

            CHỈ trả về JSON thuần:
            {"isOnTopic": true} hoặc {"isOnTopic": false, "reason": "lý do ngắn gọn bằng tiếng Việt"}
            """.formatted(question, answer);

        String checkRaw = callGroq(
            "Bạn chỉ trả về JSON thuần, không thêm bất kỳ text nào khác.",
            checkPrompt, 0.1, 128
        );

        boolean isOnTopic = checkRaw.contains("\"isOnTopic\": true") || checkRaw.contains("\"isOnTopic\":true");
        if (!isOnTopic) {
            String reason = "Câu trả lời lạc chủ đề, vui lòng trả lời lại!";
            try {
                int ri = checkRaw.indexOf("\"reason\"");
                if (ri != -1) {
                    int s = checkRaw.indexOf("\"", ri + 9) + 1;
                    int e = checkRaw.indexOf("\"", s);
                    if (s > 0 && e > s) reason = checkRaw.substring(s, e);
                }
            } catch (Exception ignored) {}
            return Map.of("status", "OFF_TOPIC", "reason", reason);
        }

        // 2b: Lưu câu trả lời của ứng viên
        saveConversation(user, "user", answer, "interview_answer", sessionId);

        // 2c: AI đánh giá
        String evalPrompt = """
            Bạn là chuyên gia phỏng vấn tuyển dụng.

            Câu hỏi: %s
            Câu trả lời của ứng viên: %s

            Đánh giá câu trả lời theo định dạng sau, bằng tiếng Việt:

            ⭐ Điểm: X/10

            ✅ Điểm tốt:
            - ...

            💡 Cần cải thiện:
            - ...

            📌 Gợi ý trả lời tốt hơn:
            (1–2 câu ngắn gọn)

            Quy tắc: Dưới 100 từ, không viết đoạn văn dài.
            """.formatted(question, answer);

        String evaluation = callGroq(
            "Bạn là chuyên gia phỏng vấn, đánh giá ngắn gọn và chuyên nghiệp bằng tiếng Việt.",
            evalPrompt, 0.4, 512
        );

        // 2d: Lưu đánh giá của AI
        saveConversation(user, "assistant", evaluation, "interview_evaluation", sessionId);

        return Map.of("status", "ON_TOPIC", "evaluation", evaluation);
    }

    // ── HELPER dùng chung ─────────────────────────────────────────────────────
    private String callGroq(String systemPrompt, String userPrompt, double temperature, int maxTokens) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> body = Map.of(
            "model", "llama-3.3-70b-versatile",
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user",   "content", userPrompt)
            ),
            "temperature", temperature,
            "max_tokens",  maxTokens
        );

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.groq.com/openai/v1/chat/completions", entity, Map.class);
            List<?> choices = (List<?>) response.getBody().get("choices");
            Map<?, ?> message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
            return message.get("content").toString().trim();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi kết nối AI. Vui lòng thử lại!");
        }
    }

    private void saveConversation(User user, String role, String content, String featureContext, String sessionId) {
        AiConversation conv = new AiConversation();
        conv.setUser(user);
        conv.setRole(role);
        conv.setContent(content);
        conv.setFeatureContext(featureContext);
        conv.setSessionId(sessionId);
        aiConversationRepository.save(conv);
    }

    // ── PHỎNG VẤN THỬ: AI tự sinh câu trả lời khi ứng viên không biết ──────
    public Map<String, String> generateAnswerForUser(Integer userId, String sessionId, String question) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        String prompt = """
            Bạn là chuyên gia phỏng vấn tuyển dụng.
            Hãy trả lời câu hỏi phỏng vấn sau như thể bạn là một ứng viên có kinh nghiệm,
            trả lời tự nhiên, đúng trọng tâm, bằng tiếng Việt.

            Câu hỏi: %s

            CHỈ trả về nội dung câu trả lời (2–4 câu), không thêm tiêu đề, không giải thích thêm.
            """.formatted(question);

        String aiAnswer = callGroq(
            "Bạn đóng vai ứng viên trả lời phỏng vấn, ngắn gọn, tự nhiên, bằng tiếng Việt.",
            prompt, 0.6, 300
        );

        saveConversation(user, "assistant", aiAnswer, "interview_ai_generated_answer", sessionId);

        return Map.of("answer", aiAnswer);
    }
}