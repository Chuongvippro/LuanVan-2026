package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "cv_path")
    private String cvPath; 

    @Column(name = "match_percentage")
    private Integer matchPercentage; 

    private Integer status; 

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "candidate_id") 
    private Candidate candidate;

    @ManyToOne
    @JoinColumn(name = "job_id") 
    private JobPost jobPost;
}