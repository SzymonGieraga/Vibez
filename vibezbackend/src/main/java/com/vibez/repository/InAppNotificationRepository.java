package com.vibez.repository;

import com.vibez.model.InAppNotification;
import com.vibez.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.QueryHint;

import java.util.List;

public interface InAppNotificationRepository extends JpaRepository<InAppNotification, Long> {

    @Query("SELECT n FROM InAppNotification n LEFT JOIN FETCH n.actor WHERE n.recipient = :recipient ORDER BY n.createdAt DESC")
    @QueryHints({
            @QueryHint(name = "jakarta.persistence.cache.retrieveMode", value = "BYPASS")
    })
    List<InAppNotification> findByRecipientWithActor(@Param("recipient") User recipient);


    @QueryHints({
            @QueryHint(name = "jakarta.persistence.cache.retrieveMode", value = "BYPASS")
    })
    long countByRecipientAndIsReadFalse(User recipient);
}