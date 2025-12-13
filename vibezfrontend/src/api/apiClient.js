import { Client } from '@stomp/stompjs';

// Teraz to jest string "/api"
const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:8443/api';

const getWebSocketUrl = (endpoint) => {
    // 1. Jeśli używamy Proxy (BASE_URL zaczyna się od "/"), musimy użyć adresu przeglądarki
    if (BASE_URL.startsWith('/')) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Zwracamy np. ws://localhost:5173/ws
        // Vite Proxy przechwyci to i wyśle do https://localhost:8443/ws
        return `${protocol}//${window.location.host}${endpoint}`;
    }

    // 2. Jeśli BASE_URL to pełny adres (np. produkcja bez proxy), stara logika działa
    const url = new URL(endpoint, BASE_URL);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.href.replace('/api', '');
};

export const apiClient = async (endpoint, options = {}) => {
    // ... tutaj bez zmian, fetch świetnie radzi sobie ze ścieżkami względnymi
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

    // Fetch "/api/users/sync" -> Vite Proxy -> Backend
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response;
};

// ... reszta pliku bez zmian (initWebSocket)
export const initWebSocket = (token, onConnectCallback) => {
    const client = new Client({
        webSocketFactory: () => new WebSocket(getWebSocketUrl('/ws')), // Tu podajemy endpoint '/ws'
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