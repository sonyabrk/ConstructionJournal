import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './AuthPage.scss';

const AuthPage = () => {
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
            
            const token = await authService.login({ email, password });
            console.log('Login successful with token:', token);
            
            window.dispatchEvent(new Event('storage'));
            
            setTimeout(() => {
                console.log('Navigating to /objects...');
                navigate('/objects', { replace: true });
            }, 200);
            
        } catch (error) {
            console.error('Login failed:', error);
            setError('Ошибка авторизации. Проверьте email и пароль.');
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
                    <label htmlFor="email">Логин:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
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