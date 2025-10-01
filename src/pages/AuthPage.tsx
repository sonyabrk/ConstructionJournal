// import { useState } from "react";
// import { authService } from "../services/authService";
// import { useNavigate } from "react-router-dom";
// import { type ApiError } from "../services/apiError";

// const AuthPage = () => {
//     const [credentials, setCredentials] = useState({ email: '', password: '' });
//     const [error, setError] = useState<string>('');
//     const [isLoading, setIsLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError('');
//         setIsLoading(true);

//         try {
//             await authService.login(credentials);
//             navigate('/objects', { replace: true });  
//         } catch (error) {
//             setError(getErrorMessage(error));
//         } finally {
//             setIsLoading(false);
//         }
//     };


//     const getErrorMessage = (error: unknown): string => {
//         if (typeof error === 'object' && error !== null) {
//             const axiosError = error as ApiError;
            
//             if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
//                 return 'Ошибка сети. Проверьте подключение к интернету.';
//             }
            
//             const status = axiosError.response?.status;
//             const message = axiosError.response?.data?.message;
            
//             switch (status) {
//                 case 401:
//                     return 'Неверный email или пароль.';
//                 case 422:
//                     return 'Некорректные данные. Проверьте введенные значения.';
//                 case 500:
//                     return 'Внутренняя ошибка сервера. Попробуйте позже.';
//                 default:
//                     return message || 'Произошла неизвестная ошибка.';
//             }
//         }
//         return 'Произошла неизвестная ошибка.';
//     };

//     return (
//         <form onSubmit={handleSubmit} className="login-form">
//             <div className="authGroup">
//                 <label htmlFor="email">Логин:</label>
//                 <input
//                 type="email"
//                 id="email"
//                 placeholder="Введите email"
//                 value={credentials.email}
//                 onChange={(e) => setCredentials({...credentials, email: e.target.value})}
//                 required
//                 disabled={isLoading}
//                 />
//             </div>
            
//             <div className="authGroup">
//                 <label htmlFor="password">Пароль:</label>
//                 <input
//                 type="password"
//                 id="password"
//                 placeholder="Введите пароль"
//                 value={credentials.password}
//                 onChange={(e) => setCredentials({...credentials, password: e.target.value})}
//                 required
//                 disabled={isLoading}
//                 />
//             </div>

//             {error && (
//                 <div className="error-message">
//                 {error}
//                 </div>
//             )}
            
//             <button 
//                 type="submit" 
//                 disabled={isLoading}
//                 className="authEnterBtn"
//             >
//                 {isLoading ? 'Вход...' : 'Войти'}
//             </button>
//         </form>
//     );
// }

// export default AuthPage;

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
    );
};

export default AuthPage;