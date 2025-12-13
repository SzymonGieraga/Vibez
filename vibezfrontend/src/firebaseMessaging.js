import { getMessaging, getToken } from "firebase/messaging";
import { getAuth } from "firebase/auth";
import app from './firebaseConfig';
import { apiClient } from './api/apiClient';

const VAPID_KEY = "BBfSgKzI_HVZ25YqVCqwLLp5D8XpXeVZi8G3yQSol_NHfeLKzy-Cm1q3uiZJdPxhK--POw-QgZsOjZbYvD40GUc";

const messaging = getMessaging(app);

const sendTokenToBackend = async (token) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const authToken = await user.getIdToken();

        await apiClient('/users/me/register-device-token', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'text/plain'
            },
            body: token
        });
        console.log("Token FCM został pomyślnie wysłany do backendu.");

    } catch (error) {
        console.error("Error sending FCM token to backend: ", error);
    }
};

export const setupNotifications = async () => {
    if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        try {
            const currentToken = await getToken(messaging, {
                vapidKey: VAPID_KEY
            });

            if (currentToken) {
                await sendTokenToBackend(currentToken);
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } catch (err) {
            console.log('An error occurred while retrieving token. ', err);
        }
    }
};