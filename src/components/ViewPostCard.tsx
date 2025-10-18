import React, { useEffect } from 'react';
import { type Post, type User } from '../services/types';
import './ViewPostCard.scss';

interface ViewPostCardProps {
    post: Post;
    currentUser?: User | null;
    onClose?: () => void;
}

const ViewPostCard = ({ post, currentUser, onClose }: ViewPostCardProps) => {
    // Блокировка скролла при открытии модалки
    useEffect(() => {
        document.body.classList.add('view-post-body-no-scroll');

        return () => {
            document.body.classList.remove('view-post-body-no-scroll');
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

    return (
        <div
            className="view-post-modal-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="view-post-modal-content">

                <div className="view-post-header">
                    <h1 id="modal-title">Запись</h1>
                </div>

                <div className="view-post-section">
                    <h2>Название записи</h2>
                    <p>{post.title}</p>
                    <h2>Содержимое</h2>
                    <p>{post.content}</p>
                    
                </div>

                <div className="view-doc-section">
                    <h2>Фото и документы</h2>
                    {post.files && post.files.length > 0 ? (
                        <div className="view-post-files-list">
                            {post.files.map((file, index) => (
                                <div key={index} className="view-post-file-item">
                                    {file}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="view-post-no-files">Нет прикрепленных файлов</p>
                    )}
                </div>

                <div className="view-post-actions">
                    <button
                        className="view-post-primary-button"
                        onClick={onClose}
                    >
                        <strong>Закрыть</strong>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPostCard;