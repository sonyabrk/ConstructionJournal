import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './AuthPage.scss';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            console.log('=== LOGIN PROCESS STARTED ===');
            console.log('Credentials:', { email, password });
            
            const response = await authService.login({ email, password });
            console.log('Login successful, response:', response);
            
            // текущий пользователя для проверки
            const currentUser = authService.getCurrentUser();
            console.log('Current user after login:', currentUser);
            
            if (!currentUser) {
                throw new Error('User data not found after login');
            }
            
            if (!currentUser.role) {
                console.warn('User role is missing, this might cause issues');
            }
            
            if (onAuthSuccess) {
                onAuthSuccess();
            }
            
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('authChange'));
            
            setTimeout(() => {
                console.log('Navigating to /objects...');
                navigate('/objects', { replace: true });
            }, 100);
            
        } catch (error) {
            console.error('Login failed:', error);
            
            if (error instanceof Error) {
                if (error.message.includes('Network Error')) {
                    setError('Ошибка сети. Проверьте подключение к интернету.');
                } else if (error.message.includes('401')) {
                    setError('Неверный email или пароль.');
                } else if (error.message.includes('user data')) {
                    setError('Ошибка загрузки данных пользователя. Попробуйте еще раз.');
                } else {
                    setError('Ошибка авторизации: ' + error.message);
                }
            } else {
                setError('Неизвестная ошибка авторизации.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg'>
            <form onSubmit={handleSubmit} className="login-form">
                <p>Вход в систему</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="authGroup">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Введите ваш email"
                    />
                </div>
                
                <div className="authGroup">
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Введите ваш пароль"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="authEnterBtn"
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};

export default AuthPage;