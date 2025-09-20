import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';

// адрес сервера (берется из переменных окружения или используется значение по умолчанию)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// экземпляр axios с настройками
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,  // базовый адрес API 
    timeout: 10000,         // макс. время ожидания (10 сек)

    headers: {
        'Content-Type': 'application/json',
    },
});

// 1ый перехватчик (добавление JWT токена к каждому запросу)
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // получение токена из сервиса аутентификации
        const token = authService.getToken();
        if (token && config.headers) {
            // добавление токена в заголовок Authorization
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        // если произошла ошибка на этапе формирования запроса
        return Promise.reject(error);
    }
);

// 2ой перехватчик: обработка ответов от сервера
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        // получение оригинального запроса и добавление флага _retry
        const origRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        // при ошибке 401 (не авторизирован) и это не повторный запрос
        if (error.response?.status === 401 && !origRequest._retry) {
            origRequest._retry = true;  // пометка запроса как повторного
            try {
                // попытка обновления токена
                const refreshed = await authService.refreshToken();
                if (refreshed) {
                    return api(origRequest);
                }
            } catch (error) {
                console.error('Token refresh failed:', error);
                // если не удалось обновить токен - выход из системы
                authService.logout();
                window.location.href = '/login';
            }
        }
        // если ошибка не 401 или уже была попытка повторного запроса
        return Promise.reject(error);
    }
);

export default api;