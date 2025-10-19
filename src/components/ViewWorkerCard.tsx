import React, { useEffect } from 'react';
import { type User } from '../services/types';
import './ViewWorkerCard.scss';

interface ViewWorkerCardProps {
    worker: User;
    onClose?: () => void;
    onDelete?: (workerId: number) => void;
    currentUserRole?: string;
}

const ViewWorkerCard = ({ worker, onClose, onDelete, currentUserRole }: ViewWorkerCardProps) => {
    // Блокировка скролла при открытии модалки
    useEffect(() => {
        document.body.classList.add('worker-view-body-no-scroll');

        return () => {
            document.body.classList.remove('worker-view-body-no-scroll');
        };
    }, []);

    // Закрытие по ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Закрытие по клику на оверлей
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    // Обработчик удаления рабочего
    const handleDelete = () => {
        if (worker.id && onDelete) {
            if (window.confirm('Вы уверены, что хотите удалить этого работника?')) {
                onDelete(worker.id);
                if (onClose) {
                    onClose();
                }
            }
        }
    };

    // Проверка прав на удаление (только админ или текущий пользователь не удаляет сам себя)
    const canDelete = currentUserRole === 'ROLE_SUPERVISION';

    return (
        <div
            className="worker-view-modal-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="worker-modal-title"
        >
            <div className="worker-view-modal-content">

                <div className="worker-view-header">
                    <h1 id="worker-modal-title">Информация о работнике</h1>
                </div>

                <div className="worker-view-section">
                    <div className="worker-view-info">
                        <div className="worker-view-info-item">
                            <h2>Имя пользователя</h2>
                            <div className="worker-view-info-value">
                                {worker.username || 'Не указано'}
                            </div>
                        </div>

                        <div className="worker-view-info-item">
                            <h2>Email</h2>
                            <div className="worker-view-info-value">
                                {worker.email}
                            </div>
                        </div>

                        <div className="worker-view-info-item">
                            <h2>Должность</h2>
                            <div className="worker-view-info-value">
                                {worker.position || 'Не указана'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="worker-view-actions">
                    <button
                        className="worker-view-primary-button"
                        onClick={onClose}
                    >
                        Закрыть
                    </button>
                    {canDelete && (
                        <button
                            className="worker-view-delete-button"
                            onClick={handleDelete}
                        >
                            Удалить
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewWorkerCard;