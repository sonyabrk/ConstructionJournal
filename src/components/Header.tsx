import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import profileSvg from "../assets/profile.svg";
import './Header.scss';

function Header() {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // закрытие dropdown при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        const confirmLogout = window.confirm('Вы уверены, что хотите выйти из системы?');
        
        if (confirmLogout) {
            authService.logout();
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('authChange'));
            navigate('/auth', { replace: true });
            alert('Вы успешно вышли из системы');
        }
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        e.preventDefault();
        toggleDropdown();
    };

    return (
        <>
            <div className="header">
                <p className="headerJournal">Электронный журнал</p>
                
                <div className="headerProfileContainer" ref={dropdownRef}>
                    <a 
                        href="#" 
                        className="headerProfile"
                        onClick={handleProfileClick}
                    >
                        <img className="headerProfileImg" src={profileSvg} alt="Профиль"/>
                        {currentUser && (
                            <span className="user-badge">
                                {currentUser.username || currentUser.email}
                            </span>
                        )}
                    </a>
                    
                    {isDropdownOpen && currentUser && (
                        <div className="profile-dropdown">
                            <div className="dropdown-header">
                                <div className="user-name">{currentUser.username || 'Пользователь'}</div>
                                <div className="user-email">{currentUser.email}</div>
                                <div className="user-role">
                                    {currentUser.position || currentUser.role}
                                </div>
                            </div>
                            
                            <div className="dropdown-divider"></div>
                            
                            <div className="dropdown-actions">
                                <div className="dropdown-divider"></div>
                                <button 
                                    className="dropdown-btn logout-btn"
                                    onClick={handleLogout}
                                >
                                     Выйти
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Header;