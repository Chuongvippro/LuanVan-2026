package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "error_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Integer id;

    @Column(name = "error_name", nullable = false)
    private String errorName;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)") 
    private String notes;

    private String status; 

    @Column(name = "created_at", insertable = false, updatable = false) 
    private LocalDateTime createdAt;

    // --- MỐI QUAN HỆ KHÓA NGOẠI VỚI BẢNG USERS ---
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}