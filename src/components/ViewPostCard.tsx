import React, { useEffect } from 'react';
import { type Post, type User } from '../services/types';
import './ViewPostCard.scss';

interface ViewPostCardProps {
    post: Post;
    currentUser?: User | null;
    onClose?: () => void;
}

const ViewPostCard = ({ post, onClose }: ViewPostCardProps) => {
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

    // Функция для скачивания файла
    const handleDownloadFile = async (fileName: string) => {
        try {
            // Предполагаем, что файлы доступны по URL /api/files/{fileName}
            const fileUrl = `/api/files/${fileName}`;

            // Создаем временную ссылку для скачивания
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Ошибка при скачивании файла:', error);
            alert('Не удалось скачать файл');
        }
    };

    // Функция для скачивания всех файлов
    const handleDownloadAllFiles = async () => {
        if (!post.files || post.files.length === 0) return;

        try {
            for (const fileName of post.files) {
                await handleDownloadFile(fileName);
                // Небольшая задержка между скачиваниями
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error('Ошибка при скачивании файлов:', error);
        }
    };

    // Функция для определения типа файла и иконки
    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();

        
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
                    <div className="files-section-header">
                        <h2>Фото и документы</h2>
                        {post.files && post.files.length > 0 && (
                            <button
                                className="download-all-btn"
                                onClick={handleDownloadAllFiles}
                            >
                                Скачать все
                            </button>
                        )}
                    </div>

                    {post.files && post.files.length > 0 ? (
                        <div className="view-post-files-list">
                            {post.files.map((file, index) => (
                                <div key={index} className="view-post-file-item">
                                    <div className="file-info">
                                        <span className="file-name">{file}</span>
                                    </div>
                                    <button
                                        className="download-file-btn"
                                        onClick={() => handleDownloadFile(file)}
                                        title="Скачать файл"
                                    >
                                        Скачать
                                    </button>
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