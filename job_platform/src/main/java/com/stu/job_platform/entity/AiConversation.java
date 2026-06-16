package com.stu.job_platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_conversations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AiConversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String role; 

    @Lob
    private String content; 

    @Column(name = "feature_context")
    private String featureContext; 

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id") 
    private User user;
}