import api from './api';
import {
    type LoginRequest,
    type LoginResponse,
    type RefreshTokenRequest,
    type RefreshTokenResponse,
    type User
} from './types';

class AuthService {
    // метод входа пользователя
    async login(credentials: LoginRequest): Promise<LoginResponse> {
         try {
            const res = await api.post('/auth/', credentials);
            console.log('Full response:', res);
            console.log('Response data:', res.data);
            
            if (!res.data || !res.data.token) {
                throw new Error('Invalid server response: missing token');
            }
            
            const { token } = res.data;
            
            const user: User = {
                email: credentials.email,
            };
            
            this.setToken(token);
            this.setCurrentUser(user);

            return {
                token,
                user,
                refreshToken: undefined 
            };

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // метод обновления токена
    async refreshToken(): Promise<boolean> {
        try {
            // получение refreshToken из localStorage
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                return false;
            }
            // формирование запроса
            const req: RefreshTokenRequest = { refreshToken };
            // отправка запроса на обновление токена
            const res = await api.post<RefreshTokenResponse>('/auth/refresh', req);
            const { token } = res.data;
            this.setToken(token);
            return true;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();  // выход из системы при ошибке обновления токена
            return false;
        }
    }

    // выход из системы
    logout(): void {
        this.removeToken();
        this.removeRefreshToken();
        this.removeCurrentUser();
    }

    // проверка авторизации
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // методы для работы с localStorage (инкапсуляция логики работы с хранилищем)
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    setCurrentUser(user: User): void {
        localStorage.setItem('user', JSON.stringify(user));
    }

    removeCurrentUser(): void {
        localStorage.removeItem('user');
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    setToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    removeToken(): void {
        localStorage.removeItem('authToken');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    setRefreshToken(refreshToken: string): void {
        localStorage.setItem('refreshToken', refreshToken);
    }

    removeRefreshToken(): void {
        localStorage.removeItem('refreshToken');
    }
    
}

export const authService = new AuthService;
