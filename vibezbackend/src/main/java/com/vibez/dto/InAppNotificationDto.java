package com.vibez.dto;

import com.vibez.model.InAppNotification;
import com.vibez.model.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class InAppNotificationDto {

    private Long id;
    private String title;
    private String body;
    private String relativeUrl;
    private boolean isRead;
    private LocalDateTime createdAt;

    private String actorUsername;
    private String actorProfilePictureUrl;

    public InAppNotificationDto(InAppNotification notification) {
        this.id = notification.getId();
        this.title = notification.getTitle();
        this.body = notification.getBody();
        this.relativeUrl = notification.getRelativeUrl();
        this.isRead = notification.isRead();
        this.createdAt = notification.getCreatedAt();

        User actor = notification.getActor();
        if (actor != null) {
            this.actorUsername = actor.getUsername();
            this.actorProfilePictureUrl = actor.getProfilePictureUrl();
        }
    }
}