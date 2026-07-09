package com.stu.job_platform.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class CvUploadResponse {
    private String cvFileName;
    private String message;
}