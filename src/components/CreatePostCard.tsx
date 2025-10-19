import React, { useState } from 'react';
import { type User, type Post } from '../services/types';
import { postService } from '../services/postService';
import { offlineService } from '../services/offlineService';
import './CreatePostCard.scss';

interface CreatePostCardProps {
    currentUser?: User | null;
    onPostCreated?: (post: Post) => void;
    onCancel?: () => void;
    projectId: number;
}

// Типы записей по ролям
type ContractorRecordType =
    | 'Добавление ТТН'
    | 'Отчеты по работам'
    | 'Исправление замечаний'
    | 'Исправление нарушений';

type SupervisionRecordType =
    | 'Добавление замечания'
    | 'Подтверждение исправления замечания'
    | 'Отклонение исправления замечания';

type InspectorRecordType =
    | 'Инициирование лаб. отбора'
    | 'Добавление нарушения'
    | 'Подтверждение исправления нарушения'
    | 'Отклонение исправления нарушения';

type RecordType = ContractorRecordType | SupervisionRecordType | InspectorRecordType;

const CreatePostCard = ({ currentUser, onPostCreated, onCancel, projectId }: CreatePostCardProps) => {
    const userRole = currentUser?.role;
    const isContractor = userRole === 'ROLE_CONTRACTOR';
    const isSupervision = userRole === 'ROLE_SUPERVISION';
    const isInspector = userRole === 'ROLE_INSPECTOR';
    const isAdmin = userRole === 'ROLE_ADMIN';

    const [postData, setPostData] = useState({
        title: '',
        content: '',
        type: '' as RecordType,
        files: [] as File[],
        hasPhoto: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // блокировка скролла при открытии модалки
    React.useEffect(() => {
        document.body.classList.add('create-post-body-no-scroll');

        return () => {
            document.body.classList.remove('create-post-body-no-scroll');
        };
    }, []);

    // закрытие по ESC
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onCancel) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    // получение доступных типов записей в зависимости от роли
    const getRecordTypesByRole = (): RecordType[] => {
        if (isContractor) {
            return [
                'Добавление ТТН',
                'Отчеты по работам',
                'Исправление замечаний',
                'Исправление нарушений'
            ];
        } else if (isSupervision) {
            return [
                'Добавление замечания',
                'Подтверждение исправления замечания',
                'Отклонение исправления замечания'
            ];
        } else if (isInspector) {
            return [
                'Инициирование лаб. отбора',
                'Добавление нарушения',
                'Подтверждение исправления нарушения',
                'Отклонение исправления нарушения'
            ];
        } else if (isAdmin) {
            return [
                'Добавление ТТН',
                'Отчеты по работам',
                'Исправление замечаний',
                'Исправление нарушений',
                'Инициирование лаб. отбора',
                'Добавление нарушения',
                'Подтверждение исправления нарушения',
                'Отклонение исправления нарушения',
                'Добавление замечания',
                'Подтверждение исправления замечания',
                'Отклонение исправления замечания'
            ];
        }
        return [];
    };

    const recordTypes = getRecordTypesByRole();

    const handleInputChange = (field: keyof typeof postData, value: string | boolean | File[] | RecordType) => {
        setPostData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setPostData(prev => ({
                ...prev,
                files: [...prev.files, ...newFiles]
            }));
        }
    };

    const handleRemoveFile = (index: number) => {
        setPostData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        // Проверяем, что клик был именно на оверлей, а не на его дочерние элементы
        if (e.target === e.currentTarget && onCancel) {
            onCancel();
        }
    };

    const handleModalContentClick = (e: React.MouseEvent) => {
        // Останавливаем всплытие события, чтобы клик внутри модалки не закрывал её
        e.stopPropagation();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!postData.type || !postData.title || !postData.content) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        if (!currentUser?.id) {
            alert('Пользователь не авторизован');
            return;
        }

        setIsSubmitting(true);
        try {
            const finalTitle = `[${postData.type}] ${postData.title}`;

            const postRequest = {
                title: finalTitle,
                content: postData.content,
                author: currentUser.id,
                object: projectId,
                files: postData.files.length > 0 ? postData.files : undefined,
                status: 'published'
            };

            let createdPost: Post;

            if (offlineService.isOnline()) {
                // Онлайн режим
                createdPost = await postService.createPost(postRequest);
                console.log('✅ Post created online:', createdPost);
            } else {
                // Офлайн режим
                if (!offlineService.canSavePostOffline(postRequest)) {
                    alert('Невозможно сохранить пост с файлами в офлайн режиме');
                    setIsSubmitting(false);
                    return;
                }

                const actionId = await offlineService.saveAction('CREATE_POST', postRequest);
                console.log('📱 Post saved offline with ID:', actionId);

                createdPost = {
                    id: parseInt(actionId),
                    title: finalTitle,
                    content: postData.content,
                    created_at: new Date().toISOString(),
                    files: [],
                    status: 'offline',
                    author: currentUser
                };
            }

            if (onPostCreated) {
                onPostCreated(createdPost);
            }

        } catch (error) {
            console.error('Ошибка при создании поста:', error);
            alert('Ошибка при создании поста');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="create-post-modal-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-post-title"
        >
            <div
                className="create-post-modal-content"
                onClick={handleModalContentClick} // Добавляем обработчик для контента
            >
                <div className="create-post-header">
                    <h1 id="create-post-title">Создание записи</h1>
                </div>

                <form onSubmit={handleSubmit} className="create-post-form">
                    <div className="create-post-section">
                        <h2>Тип записи</h2>
                        <select
                            className="create-post-select"
                            value={postData.type}
                            onChange={(e) => handleInputChange('type', e.target.value as RecordType)}
                            required
                        >
                            <option value="">Выберите тип записи</option>
                            {recordTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="create-post-section">
                        <h2>Название записи</h2>
                        <input
                            type="text"
                            className="create-post-input"
                            placeholder="Введите название записи"
                            value={postData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            required
                        />
                    </div>

                    <div className="create-post-section">
                        <h2>Содержимое</h2>
                        <textarea
                            className="create-post-textarea"
                            placeholder="Введите содержимое записи"
                            value={postData.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            required
                            rows={6} // Добавляем фиксированное количество строк для лучшего UX
                        />
                    </div>

                    <div className="create-post-section">
                        <h2>Фото и документы</h2>
                        <button
                            type="button"
                            className="create-post-file-button"
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            Добавить файлы
                        </button>
                        <input
                            id="file-input"
                            type="file"
                            className="create-post-file-input"
                            multiple
                            onChange={handleFileChange}
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        />

                        {postData.files.length > 0 && (
                            <div className="create-post-files-section">
                                <p>Выбранные файлы:</p>
                                <div className="create-post-files-list">
                                    {postData.files.map((file, index) => (
                                        <div key={index} className="create-post-file-item">
                                            <span className="create-post-file-name">{file.name}</span>
                                            <button
                                                type="button"
                                                className="create-post-remove-file"
                                                onClick={() => handleRemoveFile(index)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="create-post-actions">
                        <button
                            type="submit"
                            className="create-post-submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Создание...' : 'Создать запись'}
                        </button>
                        {onCancel && (
                            <button
                                type="button"
                                className="create-post-cancel-button"
                                onClick={onCancel}
                            >
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostCard;