package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidates")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Candidate {
    @Id
    private Integer id; 

    private String phone;
    private String address;
    
    @Column(name = "cv_path")
    private String cvPath;

    @Lob 
    private String skills;

    @OneToOne
    @MapsId 
    @JoinColumn(name = "id")
    private User user;
}