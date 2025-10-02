// import axios, { type AxiosInstance, type AxiosResponse, AxiosError, type InternalAxiosRequestConfig } from 'axios';
// import { authService }  from './authService';

// // адрес сервера (берется из переменных окружения или используется значение по умолчанию)
// const API_BASE_URL = '/api';

// // экземпляр axios с настройками
// const api: AxiosInstance = axios.create({
//     baseURL: API_BASE_URL,  // базовый адрес API 
//     timeout: 10000,         // макс. время ожидания (10 сек)

//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // 1ый перехватчик (добавление JWT токена к каждому запросу)
// api.interceptors.request.use(
//     (config: InternalAxiosRequestConfig) => {
//         // получение токена из сервиса аутентификации
//         const token = authService.getToken();
//         if (token && config.headers) {
//             // добавление токена в заголовок Authorization
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error: AxiosError) => {
//         // если произошла ошибка на этапе формирования запроса
//         return Promise.reject(error);
//     }
// );

// // 2ой перехватчик: обработка сетевых ошибок (ответов)
// api.interceptors.response.use(
//     (response: AxiosResponse) => {
//         console.log('Response status:', response.status);
//         console.log('Response data:', response.data);
//         return response;
//     },
//     async (error: AxiosError) => {
//         // обработка сетевых ошибок
//         if (error.code === 'ERR_NETWORK') {
//             console.error('Network error: no connection to server');
//         }
        
//         const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
//         // при ошибке 401 (не авторизирован) и это не повторный запрос
//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;
//             try {
//                 // Пытаемся обновить токен
//                 const refreshed = await authService.refreshToken();
//                 if (refreshed) {
//                     // Если токен обновлен, повторяем оригинальный запрос
//                     return api(originalRequest);
//                 }
//             } catch (refreshError) {
//                 console.error('Token refresh failed:', refreshError);
//                 // если не удалось обновить токен - выход из системы
//                 authService.logout();
//                 window.location.href = '/auth';
//             }
//         }
//         // если ошибка не 401 или уже была попытка повторного запроса
//         return Promise.reject(error);
//     }
// );

// export default api;

import axios, { type AxiosInstance, type AxiosResponse, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';

const API_BASE_URL = '/api';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
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