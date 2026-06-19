package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "industries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Industry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String name;

    private Integer status;
}