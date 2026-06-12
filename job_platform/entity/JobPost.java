package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "jd_text")
    @Lob 
    private String jdText;

    private Integer status;

    @ManyToOne
    @JoinColumn(name = "recruiter_id") 
    private Recruiter recruiter;

    @ManyToOne
    @JoinColumn(name = "category_id")  
    private JobCategory jobCategory;
}