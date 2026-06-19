package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_categories")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class JobCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private Integer status;

    @ManyToOne
    @JoinColumn(name = "industry_id") 
    private Industry industry;
}