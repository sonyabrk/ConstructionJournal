import axios, { type AxiosInstance, type AxiosResponse, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';

const API_BASE_URL = '/api';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
         authorization: localStorage.getItem('authToken')
    },
});

// интерцептор для добавления JWT токена
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = authService.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log('   ❌ No token available for request');
        }
        
        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// интерцептор для обработки ответов
api.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('✅ RESPONSE SUCCESS:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.log('🔄 401 Unauthorized - logging out');
            const currentToken = authService.getToken();
            console.log('   Current token during 401:', currentToken);
            authService.logout();
            window.location.href = '/auth';
        }
        
        return Promise.reject(error);
    }
);

export default api;