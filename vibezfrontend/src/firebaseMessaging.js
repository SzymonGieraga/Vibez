import { getMessaging, getToken } from "firebase/messaging";
import { getAuth } from "firebase/auth";
import app from './firebaseConfig';

const VAPID_KEY = "BBfSgKzI_HVZ25YqVCqwLLp5D8XpXeVZi8G3yQSol_NHfeLKzy-Cm1q3uiZJdPxhK--POw-QgZsOjZbYvD40GUc";

const messaging = getMessaging(app);

const sendTokenToBackend = async (token) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const authToken = await user.getIdToken();

        const response = await fetch('http://localhost:8080/api/users/me/register-device-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Authorization': `Bearer ${authToken}`
            },
            body: token
        });

        if (!response.ok) {
            throw new Error(`Backend returned status ${response.status}`);
        }

    } catch (error) {
        console.error("Error sending FCM token to backend: ", error);
    }
};

export const setupNotifications = async () => {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {

        try {
            const currentToken = await getToken(messaging, {
                vapidKey: VAPID_KEY
            });

            if (currentToken) {
                await sendTokenToBackend(currentToken);
            } else {
            }
        } catch (err) {
        }
    }
};