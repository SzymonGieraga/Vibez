import { Client } from '@stomp/stompjs';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:8443/api';

const getWebSocketUrl = (endpoint) => {
    if (BASE_URL.startsWith('/')) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}${endpoint}`;
    }

    const url = new URL(endpoint, BASE_URL);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.href.replace('/api', '');
};

export const apiClient = async (endpoint, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const defaultHeaders = isFormData ? {} : {'Content-Type': 'application/json',};

    let url;
    if (endpoint.startsWith('http')) {
        url = endpoint;
    } else {
        url = `${BASE_URL}${endpoint}`;
    }

    const config = {...options,
        headers: {...defaultHeaders, ...options.headers,},
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.error?.message || errorBody.message || response.statusText;
        throw new Error(errorMessage);
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