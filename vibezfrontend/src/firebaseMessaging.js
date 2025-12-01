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

        console.log("FCM Token sent to backend successfully.");
    } catch (error) {
        console.error("Error sending FCM token to backend: ", error);
    }
};

export const setupNotifications = async () => {
    console.log("Requesting notification permission...");
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        console.log('Notification permission granted.');

        try {
            const currentToken = await getToken(messaging, {
                vapidKey: VAPID_KEY
            });

            if (currentToken) {
                console.log('FCM Token:', currentToken);
                await sendTokenToBackend(currentToken);
            } else {
                console.log('No registration token available. Request permission.');
            }
        } catch (err) {
            console.log('An error occurred while retrieving token. ', err);
        }
    } else {
        console.log('Unable to get permission to notify.');
    }
};