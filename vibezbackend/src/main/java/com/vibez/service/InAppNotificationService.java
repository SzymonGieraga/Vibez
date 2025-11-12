package com.vibez.service;

import com.vibez.dto.InAppNotificationDto;
import com.vibez.model.InAppNotification;
import com.vibez.model.User;
import com.vibez.repository.InAppNotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InAppNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(InAppNotificationService.class);

    private final InAppNotificationRepository notificationRepository;

    private final SimpMessagingTemplate messagingTemplate;

    public InAppNotificationService(InAppNotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }
    @Async
    @Transactional
    public void createNewFollowerNotification(User recipient, User actor) {
        try {
            String title = "Masz nowego obserwującego!";
            String body = actor.getUsername() + " zaczął Cię obserwować.";
            String relativeUrl = "/profile/" + actor.getUsername();

            InAppNotification notification = new InAppNotification(
                    recipient,
                    actor,
                    title,
                    body,
                    relativeUrl
            );
            InAppNotification savedNotification = notificationRepository.save(notification);
            InAppNotificationDto notificationDto = new InAppNotificationDto(savedNotification);
            logger.info("Wysyłanie powiadomienia WebSocket do użytkownika: {}", recipient.getUsername());
            messagingTemplate.convertAndSendToUser(
                    recipient.getUsername(),
                    "/queue/notifications",
                    notificationDto
            );

        } catch (Exception e) {
            logger.error("Nie udało się utworzyć/wysłać powiadomienia in-app dla {} od {}", recipient.getUsername(), actor.getUsername(), e);
        }
    }
}