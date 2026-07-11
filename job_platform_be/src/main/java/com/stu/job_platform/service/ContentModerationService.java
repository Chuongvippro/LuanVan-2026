package com.stu.job_platform.service;

import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;

@Service
public class ContentModerationService {

    // Hardcode danh sách từ cấm — thêm/bớt trực tiếp ở đây khi cần
    private static final Set<String> BANNED_WORDS = new HashSet<>(Arrays.asList(
            "lon", "cc", "ngu", "hocdot",
            "dm", "dmm", "vcl", "cl",
            "diloz", "dilon", "dungmehl"
            // thêm từ khác vào đây...
    ));

    /**
     * Chuẩn hoá text: lowercase, bỏ dấu tiếng Việt, bỏ ký tự không phải chữ/số.
     * "C.ặ.c", "cẶc", "cac" -> đều thành "cac" để so khớp, né kiểu viết cách/chèn ký tự đặc biệt.
     */
    private String normalize(String input) {
        if (input == null) return "";
        String noAccent = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd').replace('Đ', 'D');
        return noAccent.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    /**
     * Kiểm tra nhiều đoạn text, trả về danh sách từ cấm tìm thấy (rỗng nếu sạch).
     */
    public List<String> findBannedWords(String... contents) {
        List<String> found = new ArrayList<>();
        for (String content : contents) {
            if (content == null || content.isBlank()) continue;
            String normalizedContent = normalize(content);
            for (String bad : BANNED_WORDS) {
                if (normalizedContent.contains(bad)) {
                    found.add(bad);
                }
            }
        }
        return found;
    }

    public boolean containsBannedWord(String... contents) {
        return !findBannedWords(contents).isEmpty();
    }
}