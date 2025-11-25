const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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