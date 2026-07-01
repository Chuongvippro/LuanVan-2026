package com.stu.job_platform.repository;

import com.stu.job_platform.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, Integer> {
    List<AiConversation> findByUserIdOrderByCreatedAtAsc(Integer userId);
    void deleteByUserId(Integer userId);

    List<AiConversation> findByUserIdAndSessionIdOrderByCreatedAtAsc(Integer userId, String sessionId);

}
