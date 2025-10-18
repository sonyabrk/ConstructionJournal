import { useState, useEffect, useRef, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { type ConstructionProject, type User, type Post } from '../services/types';
import WorkCard from '../components/WorkCard';
import PostCard from '../components/PostCard';
import CreatePostCard from '../components/CreatePostCard';
import ViewPostCard from '../components/ViewPostCard';
import Header from "../components/Header";
import MapComponent from '../components/MapComponent';
import { projectService } from '../services/projectService';
import { fileService } from '../services/fileService';
import './ObjectForInspector.scss';

interface ObjectForInspectorProps {
  currentUser?: User | null;
}

const ObjectForInspector = ({ currentUser }: ObjectForInspectorProps) => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<ConstructionProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // для создания и просмотра поста
    const [isCreatePostVisible, setIsCreatePostVisible] = useState(false);
    const [isViewPostVisible, setIsViewPostVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    
    // роли и возможности на основе currentUser из пропсов
    const userRole = currentUser?.role;
    const isContractor = userRole === 'ROLE_CONTRACTOR';
    const isSupervision = userRole === 'ROLE_SUPERVISION';
    const isInspector = userRole === 'ROLE_INSPECTOR';
    const isAdmin = userRole === 'ROLE_ADMIN';

    // права доступа для файлов л
    const canUploadAct = isContractor || isSupervision || isAdmin;
    const canDownloadAct = isContractor || isSupervision || isInspector || isAdmin;
    const canUploadComposition = isContractor || isAdmin;
    const canDownloadComposition = isContractor || isSupervision || isAdmin;
    const canAddWorkers = isContractor || isAdmin;
    const canViewWorkComposition = isContractor || isSupervision || isAdmin;

    const actFileInputRef = useRef<HTMLInputElement>(null);
    const compositionFileInputRef = useRef<HTMLInputElement>(null);

    const [actFile, setActFile] = useState<File | null>(null);
    const [compositionFile, setCompositionFile] = useState<File | null>(null);
    const [hasAct, setHasAct] = useState<boolean>(false);
    const [hasWorkComposition, setHasWorkComposition] = useState<boolean>(false);

    // Проверка существования файлов с учетом прав доступа
    const checkFilesExistence = useCallback(async () => {
        if (!projectId) return;
        
        try {
            // Проверяем акт, если пользователь имеет права на его просмотр
            if (canDownloadAct) {
                const actExists = await fileService.checkActExists(Number(projectId));
                setHasAct(actExists);
            }
            
            // Проверяем состав работ, если пользователь имеет права на его просмотр
            if (canViewWorkComposition) {
                const compositionExists = await fileService.checkWorkCompositionExists(Number(projectId));
                setHasWorkComposition(compositionExists);
            }
        } catch (error) {
            console.error('Ошибка проверки файлов:', error);
        }
    }, [projectId, canDownloadAct, canViewWorkComposition]);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                setLoading(true);
                if (!projectId) {
                    throw new Error('ID проекта не указан');
                }
                
                const projectData = await projectService.getProjectById(Number(projectId));
                setProject(projectData);
                
                await checkFilesExistence();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка загрузки');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProjectData();
        }
    }, [projectId, checkFilesExistence]); 

    const handleOpenAct = () => {
        if (hasAct) {
            downloadAct();
        } else {
            actFileInputRef.current?.click();
        }
    };

    const handleShowWorkComposition = () => {
        if (hasWorkComposition) {
            downloadWorkComposition();
        } else {
            compositionFileInputRef.current?.click();
        }
    };

    const handleActFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setActFile(file);
            uploadActFile(file);
        }
    };

    const handleCompositionFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setCompositionFile(file);
            uploadWorkCompositionFile(file);
        }
    };

    const uploadActFile = async (file: File) => {
        try {
            if (!projectId) throw new Error('ID проекта не указан');
            
            await fileService.uploadAct(Number(projectId), file);
            setHasAct(true);
            alert('Акт успешно загружен!');
            
        } catch (error) {
            console.error('Ошибка загрузки акта:', error);
            if (error instanceof Error) {
                if (error.message === 'ACT_ALREADY_EXISTS') {
                    alert('Акт уже существует и не может быть заменен. Для изменений обратитесь к администратору.');
                } else if (error.message === 'ACCESS_DENIED') {
                    alert('Доступ запрещен. У вас нет прав для загрузки акта.');
                } else if (error.message === 'OBJECT_NOT_FOUND') {
                    alert('Объект не найден');
                } else {
                    alert('Ошибка загрузки акта: ' + error.message);
                }
            } else {
                alert('Ошибка загрузки акта');
            }
        }
    };

    const uploadWorkCompositionFile = async (file: File) => {
        try {
            if (!projectId) throw new Error('ID проекта не указан');
            
            const compositionExists = await fileService.checkWorkCompositionExists(Number(projectId));
            
            if (compositionExists) {
                const shouldReplace = window.confirm(
                    'Состав работ уже существует. Хотите заменить его на новый файл?'
                );
                
                if (shouldReplace) {
                    await fileService.uploadWorkComposition(Number(projectId), file, true);
                    alert('Состав работ успешно обновлен!');
                } else {
                    alert('Замена отменена');
                    return;
                }
            } else {
                await fileService.uploadWorkComposition(Number(projectId), file, false);
                alert('Состав работ успешно загружен!');
            }
            
            setHasWorkComposition(true);
            
        } catch (error) {
            console.error('Ошибка загрузки состава работ:', error);
            if (error instanceof Error) {
                if (error.message === 'COMPOSITION_ALREADY_EXISTS') {
                    alert('Состав работ уже существует. Используйте функцию замены.');
                } else if (error.message === 'ACCESS_DENIED') {
                    alert('Доступ запрещен. У вас нет прав для загрузки состава работ.');
                } else if (error.message === 'REPLACE_FAILED') {
                    alert('Не удалось заменить состав работ');
                } else if (error.message === 'OBJECT_NOT_FOUND') {
                    alert('Объект не найден');
                } else {
                    alert('Ошибка загрузки состава работ: ' + error.message);
                }
            } else {
                alert('Ошибка загрузки состава работ');
            }
        }
    };

    const downloadAct = async () => {
        try {
            if (!projectId) throw new Error('ID проекта не указан');
            
            const blob = await fileService.downloadAct(Number(projectId));
            fileService.downloadBlob(blob, 'act.pdf');
            
        } catch (error) {
            console.error('Ошибка скачивания акта:', error);
            if (error instanceof Error && error.message === 'ACCESS_DENIED') {
                alert('Доступ запрещен. У вас нет прав для скачивания акта.');
            } else {
                alert('Ошибка скачивания акта');
            }
        }
    };

    const downloadWorkComposition = async () => {
        try {
            if (!projectId) throw new Error('ID проекта не указан');
            
            const blob = await fileService.downloadWorkComposition(Number(projectId));
            fileService.downloadBlob(blob, 'work_composition.pdf');
            
        } catch (error) {
            console.error('Ошибка скачивания состава работ:', error);
            if (error instanceof Error && error.message === 'ACCESS_DENIED') {
                alert('Доступ запрещен. У вас нет прав для скачивания состава работ.');
            } else {
                alert('Ошибка скачивания состава работ');
            }
        }
    };

    const handleAddWorker = () => {
        console.log('Добавление участника работ');
        // логика добавления участника
    };

    const handleUserReview = (user: User) => {
        console.log('Обзор пользователя:', user);
        navigate(`/user/${user.id}`);
    };

    // Обработчики для создания поста
    const handleOpenCreatePost = () => {
        setIsCreatePostVisible(true);
    };

    const handleCloseCreatePost = () => {
        setIsCreatePostVisible(false);
    };

    const handlePostCreated = (post: Post) => {
        console.log('Новый пост создан:', post);
        setIsCreatePostVisible(false);
        // Обновить список постов если нужно
    };

    // Обработчики для просмотра поста
    const handleReviewPost = (post: Post) => {
        setSelectedPost(post);
        setIsViewPostVisible(true);
    };

    const handleCloseViewPost = () => {
        setIsViewPostVisible(false);
        setSelectedPost(null);
    };

    // Обработчик для кнопки "Ответ" (создание поста в ответ)
    const handleAnswerPost = (post: Post) => {
        setSelectedPost(post); // сохраняем пост для контекста ответа
        setIsCreatePostVisible(true);
    };

    if (loading) return <div className="loadingObjInsp">Загрузка...</div>;
    if (error) return <div className="errorObjInsp">Ошибка: {error}</div>;
    if (!project) return <div className="errorObjInsp">Объект не найден</div>;

    const mainAddress = project.coordinates.length > 0 
        ? `Координаты: ${project.coordinates[0].x}, ${project.coordinates[0].y}`
        : 'Адрес не указан';

    return (
        <div className="inspectorPage">
            <Header />

            <div className="navSection">
                <button 
                    className="backBtn"
                    onClick={() => navigate('/objects')}
                > 
                    ← Назад к списку объектов 
                </button>
            </div>

                <section className="objInfo">
                    <h2>{project.name}</h2>
                    <p className="objectDescription">{project.description}</p>
                    <p className="objectAddress">{mainAddress}</p>
                </section>

                <section className="mapSection">
                    <h3>Расположение объекта</h3>
                    <div className="mapContainer">
                        <MapComponent 
                            coordinates={project.coordinates} 
                            zoom={16}
                            height="400px"
                            popupText={project.name} 
                        />
                    </div>
                </section>

            <section className="responsibleSection">
                <div className="responsibleInfo">
                    <h4>Служба строительного контроля (ответственный):</h4>
                    <p>{project.responsibleSupervision?.username || 'Не назначен'}</p>
                </div>
                
                <div className="responsibleInfo">
                    <h4>Подрядчик (ответственный):</h4>
                    <p>{project.responsibleContractor?.username || 'Не назначен'}</p>
                </div>
                
                <div className="responsibleInfo">
                    <h4>Состояние объекта:</h4>
                    <span className={`status-badge status-${project.status || 'planned'}`}>
                        {project.status === 'active' && 'Активный'}
                        {project.status === 'completed' && 'Завершен'}
                        {project.status === 'planned' && 'Запланирован'}
                        {!project.status && 'Неизвестно'}
                    </span>
                </div>
            </section>

            {/* Универсальная секция акта - отображается для всех, у кого есть права */}
            {(canUploadAct || (canDownloadAct && hasAct)) && (
                <section className="actionsSection">
                    <button className="actBtn" onClick={handleOpenAct}>
                        {hasAct ? '📥 Скачать акт открытия объекта' : 
                         actFile ? `✅ Акт загружен: ${actFile.name}` : '📤 Загрузить акт открытия объекта'}
                    </button>
                    
                    {/* Поле для загрузки файла показываем только тем, у кого есть права на загрузку И если акта еще нет */}
                    {canUploadAct && !hasAct && (
                        <input
                            type="file"
                            ref={actFileInputRef}
                            onChange={handleActFileChange}
                            style={{ display: 'none' }}
                            accept=".pdf,.doc,.docx" 
                        />
                    )}
                </section>
            )}

            {/* Посты объекта - отображаются для всех */}
            {project.posts && project.posts.length > 0 && (
                <section className="postsSection">
                    <h3>Посты объекта</h3>
                    <div className="postsContainer">
                        {project.posts.map((post: Post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onReview={handleReviewPost}
                                // Добавляем обработчик для кнопки "Ответ"
                                onAnswer={() => handleAnswerPost(post)}
                            />
                            //ДОБАВИЛА ПОСТКАРД!!!!!!!!!!!!!!!!!!!!!
                            // <div key={post.id} className="postCard">
                            //     <h4>{post.title}</h4>
                            //     <p>{post.content}</p>
                            //     <small>Создан: {post.created_at}</small>
                            // </div>
                        ))}
                    </div>
                </section>
            )}

            {(!project.posts || project.posts.length === 0) && (
                <section className="postsSection">
                    <h3>Посты объекта</h3>
                    <p>Пока нет постов для этого объекта</p>
                </section>
            )}

            {/* Сетевой график - отображается для всех */}
            <section className="scheduleSection">
                <h3>Сетевой график работ</h3>
                <div className="scheduleContainer">
                    <div className="schedulePlaceholder">
                        Сетевой график будет реализован в ближайшее время
                    </div>
                </div>
            </section>

            {/* Секция состава работ - отображается для тех, у кого есть права */}
            {(canUploadComposition || (canDownloadComposition && hasWorkComposition)) && (
                <section className="workCompositionSection">
                    <button className="compositionBtn" onClick={handleShowWorkComposition}>
                        {hasWorkComposition ? '📥 Скачать состав работ' : 
                         compositionFile ? `✅ Состав работ загружен: ${compositionFile.name}` : '📤 Загрузить состав работ'}
                    </button>
                    
                    {/* Поле для загрузки файла показываем только тем, у кого есть права на загрузку И если состав работ еще нет */}
                    {canUploadComposition && !hasWorkComposition && (
                        <input
                            type="file"
                            ref={compositionFileInputRef}
                            onChange={handleCompositionFileChange}
                            style={{ display: 'none' }}
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                        />
                    )}
                </section>
            )}

            {/* Секция рабочих - отображается для всех, но кнопка добавления только для определенных ролей */}
            <section className="workersSection">
                <div className="workersHeader">
                    <h3>Работа на строительной площадке</h3>
                    {canAddWorkers && (
                        <button className="addWorkerBtn" onClick={handleAddWorker}>
                            Добавить участника
                        </button>
                    )}
                </div>
                
                <div className="workersGrid">
                    {project.users && project.users.length > 0 ? (
                        project.users.map((user: User) => (
                            <WorkCard 
                                key={user.id} 
                                user={user}
                                onReview={handleUserReview}
                                currentUserRole={userRole}
                            />
                        ))
                    ) : (
                        <p className="noWorkers">Нет назначенных участников</p>
                    )}
                </div>
            </section>

            {/* Дополнительные секции для разных ролей */}
            {isContractor && (
                <section className="role-specific-section contractor-tools">
                    <h3>Инструменты подрядчика</h3>
                    <div className="tools-grid">
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Добавление ТТН</button>
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Отчеты по работам</button>
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Исправление замечаний</button>
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Исправление нарушений</button>
                    </div>
                </section>
            )}

            {isSupervision && (
                <section className="role-specific-section supervision-tools">
                    <h3>Инструменты надзора</h3>
                    <div className="tools-grid">
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Добавление замечаний</button>
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Подтверждение исправления замечаний</button>
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Отклонение исправления замечаний</button>
                    </div>
                </section>
            )}

            {isInspector && (
                <section className="role-specific-section inspector-tools">
                    <h3>Инструменты инспектора</h3>
                    <div className="tools-grid">
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Инициирование лаб.отбора</button>
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Добавление нарушений</button>
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Подтверждение исправления нарушений</button>
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Отклонение исправления нарушений</button>
                    </div>
                </section>
            )}

            {isAdmin && (
                <section className="role-specific-section admin-tools">
                    <h3>Панель администратора</h3>
                    <div className="tools-grid">
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Управление пользователями</button>
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Настройки проекта</button>
                        <button className="tool-btn" onClick={handleOpenCreatePost}>Системные логи</button>
                    </div>
                </section>
            )}

            {isCreatePostVisible && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <CreatePostCard
                            currentUser={currentUser}
                            onPostCreated={handlePostCreated}
                            onCancel={handleCloseCreatePost}
                            // Можно передать пост для контекста ответа
                            //parentPost={selectedPost}
                        />
                    </div>
                </div>
            )}

            {isViewPostVisible && selectedPost && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <ViewPostCard
                            post={selectedPost}
                            currentUser={currentUser}
                            onClose={handleCloseViewPost}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ObjectForInspector;