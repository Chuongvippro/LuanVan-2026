package com.stu.job_platform.service;

import io.github.cdimascio.dotenv.Dotenv;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.stu.job_platform.entity.Recruiter;

import org.springframework.http.*;
import java.util.*;

@Service
public class AiVerificationService {
    
    private final String apiKey;

    public AiVerificationService() {
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

    // Hàm cào chữ thô từ Web
    public String scrapeWebsiteText(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(8000)
                    .ignoreHttpErrors(true)
                    .get();
            return doc.select("h1, h2, footer, p").text();
        } catch (Exception e) {
            return "WEB_BLOCKED_BY_WALL";
        }
    }

    // HÀM GỌI AI XÁC THỰC RIÊNG BIỆT TỪNG TRƯỜNG DỮ LIỆU
    public String verifyFieldWithAi(String fieldType, String value, Recruiter rec, String companyEmail) {
        String apiUrl = "https://api.groq.com/openai/v1/chat/completions";
        String prompt = "";

        if ("companyName".equals(fieldType)) {
            String emailDomain = (companyEmail != null && companyEmail.contains("@")) 
                                ? companyEmail.substring(companyEmail.indexOf("@") + 1) 
                                : "n/a";

            prompt = String.format(
                "Mày là hệ thống AI kiểm định thông tin doanh nghiệp Việt Nam.\n" +
                "Dữ liệu cần thẩm định:\n" +
                "- Tên công ty: '%s'\n" +
                "- Mã số thuế đã nhập: '%s'\n" +
                "- Domain email đã nhập: '%s'\n\n" +
                "YÊU CẦU THẨM ĐỊNH:\n" +
                "1. Kiểm tra tên công ty có thật, đang hoạt động và có liên quan đến MST hoặc Domain email trên không.\n" +
                "2. Nếu tên công ty là tên giả, hoặc không khớp với MST/Domain email -> match_percentage: 0.\n" +
                "3. Nếu thông tin đồng bộ, hợp lệ -> match_percentage: 100.\n" +
                "Trả về JSON chuẩn:\n" +
                "{\n  \"match_percentage\": <0-100>,\n  \"reason\": \"<lý do chi tiết bằng tiếng Việt>\"\n}",
                value, rec.getTaxCode(), emailDomain
            );
        } else if ("taxCode".equals(fieldType)) {
            // Trích xuất domain từ email để đối chiếu
            String emailDomain = (companyEmail != null && companyEmail.contains("@")) 
                                 ? companyEmail.substring(companyEmail.indexOf("@") + 1) 
                                 : "n/a";

            prompt = String.format(
                "Mày là chuyên gia thẩm định doanh nghiệp. Dữ liệu đầu vào: [Tên công ty: '%s', MST cần check: '%s', Domain email: '%s']\n\n" +
                "YÊU CẦU BẮT BUỘC:\n" +
                "1. Mã số thuế doanh nghiệp Việt Nam PHẢI có độ dài chính xác 10 hoặc 13 chữ số. Nếu thừa hoặc thiếu -> match_percentage: 0.\n" +
                "2. CẤM tự ý sửa lỗi gõ nhầm của người dùng. Nếu nhập thừa số so với quy chuẩn MST -> match_percentage: 0.\n" +
                "3. Kiểm tra xem MST này có thuộc về tên công ty '%s' không.\n" +
                "4. Đối chiếu MST này với Domain email '%s'. Nếu không khớp/không tồn tại -> match_percentage: 0.\n" +
                "5. Nếu mọi thứ khớp và hợp lệ -> match_percentage: 100.\n" +
                "Trả về JSON chuẩn: {\"match_percentage\": ..., \"reason\": \"<lý do chi tiết>\"}",
                rec.getCompanyName(), value, emailDomain, rec.getCompanyName(), emailDomain
            );
        }else if ("websiteUrl".equals(fieldType)) {
            String emailDomain = (companyEmail != null && companyEmail.contains("@")) 
                                ? companyEmail.substring(companyEmail.indexOf("@") + 1) 
                                : "n/a";

            prompt = String.format(
                "Mày là chuyên gia thẩm định website doanh nghiệp.\n" +
                "Dữ liệu gốc: [Tên công ty: '%s', MST: '%s', Domain email: '%s']\n" +
                "Website cần thẩm định: \"%s\"\n\n" +
                "YÊU CẦU BẮT BUỘC:\n" +
                "1. Nếu website này là MXH, trang cá nhân, hay bất kỳ link nào không thuộc quyền sở hữu của công ty '%s' (dựa trên tên miền) -> match_percentage: 0.\n" +
                "2. Website doanh nghiệp chuẩn phải có domain khớp với domain email '%s'. Nếu khác domain -> match_percentage: 0.\n" +
                "3. Nếu là link của các nền tảng chat, MXH, hoặc trang trung gian -> match_percentage: 0.\n" +
                "4. Nếu thông tin khớp và là website chính thức -> match_percentage: 100.\n" +
                "Trả về JSON chuẩn: {\"match_percentage\": ..., \"reason\": \"<lý do cụ thể>\"}",
                rec.getCompanyName(), rec.getTaxCode(), emailDomain, value, rec.getCompanyName(), emailDomain
            );
        }

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> requestBody = Map.of(
            "model", "llama-3.3-70b-versatile", 
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "temperature", 0.1 // Khóa não AI chạy nghiêm túc tuyệt đối
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
            return "{\"match_percentage\": 0, \"reason\": \"Lỗi kết nối API AI!\"}";
        }
    }
}