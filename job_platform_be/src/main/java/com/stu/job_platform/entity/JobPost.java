package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_posts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class JobPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String salary;
    private String location;

    @Column(name = "job_type")
    private String jobType; // full-time, part-time, remote, internship

    @Column(name = "experience_level")
    private String experienceLevel; // junior, mid, senior

    @Column(name = "jd_text")
    @Lob
    private String jdText;

    @Lob
    private String requirements;

    @Lob
    private String benefits;

    private Integer status; // 1: active, 0: inactive/hidden, -1: deleted

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "recruiter_id")
    private Recruiter recruiter;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private JobCategory jobCategory;
}