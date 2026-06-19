package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bug_reports")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class BugReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;

    @Lob
    private String description;

    @Column(name = "screenshot_path")
    private String screenshotPath;

    private String status; // pending, resolved, rejected

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
