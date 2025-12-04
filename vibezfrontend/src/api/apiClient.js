import { Client } from '@stomp/stompjs';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getWebSocketUrl = (endpoint) => {
    const url = new URL(endpoint, BASE_URL);
    url.protocol = url.protocol.replace('http', 'ws');
    return url.href.replace('/api', '');
};

export const apiClient = async (endpoint, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const defaultHeaders = isFormData ? {} : {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response;
};

export const initWebSocket = (token, onConnectCallback) => {
    const client = new Client({
        webSocketFactory: () => new WebSocket(getWebSocketUrl('/ws')),
        connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
            onConnectCallback(client);
        },
        onStompError: (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        },
    });

    client.activate();
    return client;
};