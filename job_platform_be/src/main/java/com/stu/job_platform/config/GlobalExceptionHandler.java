package com.stu.job_platform.config;

import com.stu.job_platform.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.stream.Collectors;

/**
 * Global Exception Handler - Xử lý tất cả exception ở một nơi duy nhất
 * Trả về format chuẩn ApiResponse cho mọi lỗi
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Lỗi validation (Bean Validation: @NotBlank, @Email, @Size...)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(ApiResponse.error(errors));
    }

    /**
     * Lỗi file upload quá dung lượng (>10MB)
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<?>> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.error("File upload vượt quá dung lượng cho phép (tối đa 10MB)!"));
    }

    /**
     * Lỗi nghiệp vụ tự định nghĩa (RuntimeException)
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<?>> handleRuntime(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Lỗi không xác định (Exception chung)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGeneral(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi hệ thống! Vui lòng thử lại sau."));
    }
}
