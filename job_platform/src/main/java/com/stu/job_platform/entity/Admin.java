package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admins")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Admin {
    @Id
    private Integer id;  

    @Column(name = "admin_level")
    private Integer adminLevel; 
    private String permissions; 

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;
}