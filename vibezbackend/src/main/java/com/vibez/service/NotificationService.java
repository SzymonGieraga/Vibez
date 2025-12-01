package com.vibez.service;

import com.google.firebase.messaging.*;
import com.vibez.model.DeviceToken;
import com.vibez.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    public void sendNotificationToUser(User user, String title, String body, String relativeUrl) {
        Set<DeviceToken> tokens = user.getDeviceTokens();

        if (tokens.isEmpty()) {
            logger.warn("No device tokens found for user: {}", user.getUsername());
            return;
        }

        List<String> tokenStrings = tokens.stream()
                .map(DeviceToken::getToken)
                .collect(Collectors.toList());

        WebpushConfig webpushConfig = WebpushConfig.builder()
                .setNotification(WebpushNotification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .putData("url", relativeUrl)
                .build();

        MulticastMessage message = MulticastMessage.builder()
                .addAllTokens(tokenStrings)
                .setWebpushConfig(webpushConfig)
                .build();
        try {
            BatchResponse response = FirebaseMessaging.getInstance().sendMulticast(message);
            logger.info("Successfully sent message: " + response.getSuccessCount() + " successes, " + response.getFailureCount() + " failures.");

        } catch (FirebaseMessagingException e) {
            logger.error("Error sending Firebase message", e);
        }
    }
}