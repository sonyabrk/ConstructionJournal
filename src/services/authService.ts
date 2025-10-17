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
            
            // Сохраняем токен
            this.setToken(token);
            
            // Получаем данные пользователя с эндпоинта /user/
            const user = await this.fetchCurrentUser();
            
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

    // метод получения данных текущего пользователя с /user/
    async fetchCurrentUser(): Promise<User> {
        try {
            const res = await api.get<User>('/user/');
            console.log('User data received from /user/:', res.data);
            return res.data;
        } catch (error) {
            console.error('Error fetching user data from /user/:', error);
            
            // если запрос к /user/ не удался, пробуем альтернативные эндпоинты
            try {
                console.log('Trying alternative endpoints...');
                const endpoints = ['/users/me/', '/auth/user/', '/profile/'];
                
                for (const endpoint of endpoints) {
                    try {
                        const altRes = await api.get<User>(endpoint);
                        console.log(`User data received from ${endpoint}:`, altRes.data);
                        return altRes.data;
                    } catch (e) {
                        console.log(`Endpoint ${endpoint} failed:`, e);
                        continue;
                    }
                }
                
                throw new Error('All user endpoints failed');
                
            } catch (fallbackError) {
                console.error('All user endpoints failed:', fallbackError);
                
                // В крайнем случае создаем временного пользователя
                const temporaryUser: User = {
                    email: 'unknown@email.com',
                    role: 'ROLE_USER',
                    username: 'Пользователь',
                    position: 'Не указано'
                };
                
                return temporaryUser;
            }
        }
    }

    // метод обновления токена
    async refreshToken(): Promise<boolean> {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                return false;
            }
            
            const req: RefreshTokenRequest = { refreshToken };
            const res = await api.post<RefreshTokenResponse>('/auth/refresh', req);
            const { token } = res.data;
            this.setToken(token);
            return true;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    // метод для принудительного обновления данных пользователя
    async updateUserData(): Promise<User> {
        try {
            const user = await this.fetchCurrentUser();
            this.setCurrentUser(user);
            return user;
        } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
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

    // методы для работы с localStorage
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
    
    // методы для проверки ролей
    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }

    isContractor(): boolean {
        return this.hasRole('ROLE_CONTRACTOR');
    }

    isSupervision(): boolean {
        return this.hasRole('ROLE_SUPERVISION');
    }

    isInspector(): boolean {
        return this.hasRole('ROLE_INSPECTOR');
    }

    isAdmin(): boolean {
        return this.hasRole('ROLE_ADMIN');
    }
}

export const authService = new AuthService();