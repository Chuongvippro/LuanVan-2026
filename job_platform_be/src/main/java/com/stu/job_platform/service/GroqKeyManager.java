package com.stu.job_platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Quản lý pool nhiều API key Groq.
 * - Không cần logic "reset" thủ công: mỗi response thành công tự mang theo
 *   số quota còn lại mới nhất (header x-ratelimit-remaining-requests), chỉ
 *   cần luôn tin vào giá trị mới nhất đó.
 * - Key bị 429 sẽ bị "cooldown" tạm thời (so sánh Instant.now()), tự động
 *   hết hạn theo thời gian, không cần cờ trạng thái bật/tắt thủ công.
 */
@Component
public class GroqKeyManager {

    /** Trạng thái từng key, cập nhật liên tục từ header response thật */
    public static class KeyState {
        public final String name;
        public final String apiKey;
        public volatile int remainingRequests = Integer.MAX_VALUE; // chưa biết -> coi như còn nhiều
        public volatile Instant resetAt = Instant.EPOCH;           // lúc quota được làm mới (thông tin, không dùng để chọn key)
        public volatile Instant cooldownUntil = Instant.EPOCH;     // EPOCH = không bị khóa

        KeyState(String name, String apiKey) {
            this.name = name;
            this.apiKey = apiKey;
        }

        boolean isAvailable() {
            return Instant.now().isAfter(cooldownUntil);
        }
    }

    private final List<KeyState> keys;
    private final AtomicInteger currentIndex = new AtomicInteger(0);

    /**
     * Cấu hình trong application.properties (hoặc .env qua dotenv):
     * groq.api-keys=key1:gsk_xxx,key2:gsk_yyy,key3:gsk_zzz
     */
    public GroqKeyManager(@Value("${groq.api-keys}") String rawKeys) {
        this.keys = Arrays.stream(rawKeys.split(","))
                .map(s -> s.split(":", 2))
                .map(p -> new KeyState(p[0].trim(), p[1].trim()))
                .toList();

        if (this.keys.isEmpty()) {
            throw new IllegalStateException("Chưa cấu hình groq.api-keys!");
        }
    }

    /**
     * Trả về key đang dùng (sticky) — chỉ chuyển sang key kế tiếp khi key hiện
     * tại đã hết quota (remainingRequests <= 0) hoặc đang bị cooldown do 429.
     * Không đổi key mỗi lần gọi.
     */
    public synchronized KeyState pickKey() {
        int size = keys.size();
        for (int i = 0; i < size; i++) {
            int idx = Math.floorMod(currentIndex.get() + i, size);
            KeyState k = keys.get(idx);
            if (k.isAvailable() && k.remainingRequests > 0) {
                currentIndex.set(idx); // đứng yên ở key này cho các lần gọi sau

                // Log lại để tiện debug, không cần log mỗi lần gọi
                System.out.println(String.format("👉 [GroqKeyManager] Đang dùng [%s] | Quota còn lại: %d | Cooldown: %s", 
                    k.name, k.remainingRequests, k.cooldownUntil));
                return k;
            }
        }

        // Không còn key nào khả dụng -> chọn key sắp hết cooldown nhất
        System.out.println("⚠️ [GroqKeyManager] Tất cả Key đều bận/hết quota! Đang lấy key sắp hết cooldown...");
        // Tất cả key đều hết quota/đang cooldown -> vẫn trả về key hết cooldown
        // sớm nhất, chấp nhận rủi ro gọi thử thay vì làm gián đoạn nghiệp vụ.
        return keys.stream()
                .min(Comparator.comparing(k -> k.cooldownUntil))
                .orElseThrow();
    }

    /**
     * Gọi sau MỖI lần gọi Groq thành công, input là quota còn lại và thời gian
     * reset lấy thẳng từ header response — không cần tự tính toán reset thủ công.
     */
    public void recordSuccess(KeyState key, HttpHeaders headers) {
        String remaining = headers.getFirst("x-ratelimit-remaining-requests");
        if (remaining != null) {
            try {
                key.remainingRequests = Integer.parseInt(remaining.trim());

                // Log lại để tiện debug, không cần log mỗi lần gọi
                System.out.println(String.format("✅ [GroqKeyManager] Key [%s] gọi THÀNH CÔNG! Quota mới nhất từ Groq: %d requests", 
                    key.name, key.remainingRequests));
            } catch (NumberFormatException ignored) {
                // Groq đổi format header -> log lại 1 lần để chỉnh tên/parse cho đúng
            }
        }

        // Header dạng chuỗi vd "2m59.56s" -> parse ra Duration rồi cộng vào hiện tại
        String reset = headers.getFirst("x-ratelimit-reset-requests");
        if (reset != null) {
            Duration d = parseGroqDuration(reset);
            if (d != null) key.resetAt = Instant.now().plus(d);
        }
    }

    /** Parse chuỗi kiểu "2m59.56s" hoặc "7.66s" mà Groq trả về thành Duration */
    private Duration parseGroqDuration(String raw) {
        try {
            raw = raw.trim();
            long minutes = 0;
            double seconds;
            if (raw.contains("m")) {
                String[] parts = raw.split("m");
                minutes = Long.parseLong(parts[0]);
                seconds = Double.parseDouble(parts[1].replace("s", ""));
            } else {
                seconds = Double.parseDouble(raw.replace("s", ""));
            }
            return Duration.ofMinutes(minutes).plusMillis((long) (seconds * 1000));
        } catch (Exception e) {
            return null; // format lạ -> bỏ qua, không ảnh hưởng logic chọn key
        }
    }

    /** Gọi khi gặp HTTP 429 từ Groq, tạm khóa key này một khoảng thời gian */
    public void recordRateLimited(KeyState key, HttpHeaders headers) {
        String retryAfter = headers.getFirst("retry-after");
        Duration cooldown;
        try {
            cooldown = Duration.ofSeconds(Long.parseLong(retryAfter));
        } catch (Exception e) {
            cooldown = Duration.ofSeconds(30); // fallback nếu không có/không parse được header
        }
        key.cooldownUntil = Instant.now().plus(cooldown);

        // Log lại để tiện debug, không cần log mỗi lần gọi
        System.out.println(String.format("❌ [GroqKeyManager] Key [%s] bị 429 (RATE LIMIT)! Bị khóa trong %d giây (Đến: %s)", 
            key.name, cooldown.getSeconds(), key.cooldownUntil));
    }
}