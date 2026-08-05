package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_settings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UserSettings {
    @Id
    private Integer userId;

    // Notification preferences
    @Column(columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean emailNewJob = true;

    @Column(columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean emailApplication = true;

    @Column(columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean emailNewsletter = false;

    @Column(columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean browserPush = true;

    // Appearance preferences
    @Column(length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'normal'")
    private String fontSize = "normal";

    @Column(length = 10, columnDefinition = "VARCHAR(10) DEFAULT 'vi'")
    private String language = "vi";

    @Column(length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'red'")
    private String theme = "red";

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
}
