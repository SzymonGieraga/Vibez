package com.vibez.service;

import com.vibez.dto.InAppNotificationDto;
import com.vibez.model.InAppNotification;
import com.vibez.model.User;
import com.vibez.repository.InAppNotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

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
    @Transactional
    public void markAsRead(Long notificationId, User currentUser) {
        InAppNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono powiadomienia"));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak dostępu do tego powiadomienia");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    public List<InAppNotificationDto> getNotificationsForUser(User recipient) {
        List<InAppNotification> notifications = notificationRepository.findByRecipientWithActor(recipient);

        return notifications.stream()
                .map(InAppNotificationDto::new)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(User currentUser) {
        return notificationRepository.countByRecipientAndIsReadFalse(currentUser);
    }

    @Transactional
    public void markAllAsRead(User currentUser) {
        List<InAppNotification> notifications = notificationRepository.findByRecipientWithActor(currentUser);

        notifications.stream()
                .filter(n -> !n.isRead())
                .forEach(n -> n.setRead(true));

        notificationRepository.saveAll(notifications);
    }

}