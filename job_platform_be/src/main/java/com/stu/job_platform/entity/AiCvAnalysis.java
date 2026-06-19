package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_cv_analyses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AiCvAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String type; 

    @Column(name = "result_text")
    @Lob
    private String resultText; 

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "candidate_id") 
    private Candidate candidate;

    @ManyToOne
    @JoinColumn(name = "job_id") 
    private JobPost jobPost;
}