import { useState, useEffect, useRef, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { type ConstructionProject, type User, type Post } from '../services/types';
import WorkCard from '../components/WorkCard';
import Header from "../components/Header";
import MapComponent from '../components/MapComponent';
import { projectService } from '../services/projectService';
import { fileService } from '../services/fileService';

const ObjectForInspector = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<ConstructionProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const actFileInputRef = useRef<HTMLInputElement>(null);
    const compositionFileInputRef = useRef<HTMLInputElement>(null);

    const [actFile, setActFile] = useState<File | null>(null);
    const [compositionFile, setCompositionFile] = useState<File | null>(null);
    const [hasAct, setHasAct] = useState<boolean>(false);
    const [hasWorkComposition, setHasWorkComposition] = useState<boolean>(false);

    const checkFilesExistence = useCallback(async () => {
        if (!projectId) return;
        
        try {
            const [actExists, compositionExists] = await Promise.all([
                fileService.checkActExists(Number(projectId)),
                fileService.checkWorkCompositionExists(Number(projectId))
            ]);
            
            setHasAct(actExists);
            setHasWorkComposition(compositionExists);
        } catch (error) {
            console.error('Ошибка проверки файлов:', error);
        }
    }, [projectId]); 

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                setLoading(true);
                if (!projectId) {
                    throw new Error('ID проекта не указан');
                }
                
                const projectData = await projectService.getProjectById(Number(projectId));
                setProject(projectData);
                
                //await checkFilesExistence();
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
            alert('Ошибка загрузки акта');
        }
    };

    const downloadAct = async () => {
        try {
            if (!projectId) throw new Error('ID проекта не указан');
            
            const blob = await fileService.downloadAct(Number(projectId));
            fileService.downloadBlob(blob, 'act.pdf');
            
        } catch (error) {
            console.error('Ошибка скачивания акта:', error);
            alert('Ошибка скачивания акта');
        }
    };

    const uploadWorkCompositionFile = async (file: File) => {
        try {
            if (!projectId) throw new Error('ID проекта не указан');
            
            await fileService.uploadWorkComposition(Number(projectId), file);
            setHasWorkComposition(true);
            alert('Состав работ успешно загружен!');
            
        } catch (error) {
            console.error('Ошибка загрузки состава работ:', error);
            alert('Ошибка загрузки состава работ');
        }
    };

    const downloadWorkComposition = async () => {
        try {
            if (!projectId) throw new Error('ID проекта не указан');
            
            const blob = await fileService.downloadWorkComposition(Number(projectId));
            fileService.downloadBlob(blob, 'work_composition.pdf');
            
        } catch (error) {
            console.error('Ошибка скачивания состава работ:', error);
            alert('Ошибка скачивания состава работ');
        }
    };

    const handleAddWorker = () => {
        console.log('Добавление участника работ');
    };

    const handleUserReview = (user: User) => {
        console.log('Обзор пользователя:', user);
        navigate(`/user/${user.id}`);
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
                > ← Назад к списку объектов </button>
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

            <section className="actionsSection">
                <button className="actBtn" onClick={handleOpenAct}>
                    {hasAct ? '📥 Скачать акт открытия объекта' : 
                     actFile ? `✅ Акт загружен: ${actFile.name}` : '📤 Загрузить акт открытия объекта'}
                </button>
                
                <input
                    type="file"
                    ref={actFileInputRef}
                    onChange={handleActFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx" 
                />
            </section>

            {project.posts && project.posts.length > 0 && (
                <section className="postsSection">
                    <h3>Посты объекта</h3>
                    <div className="postsContainer">
                        {project.posts.map((post: Post) => (
                            <div key={post.id} className="postCard">
                                <h4>{post.title}</h4>
                                <p>{post.content}</p>
                                <small>Создан: {post.created_at}</small>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {project.posts && project.posts.length === 0 && (
                <section className="postsSection">
                    <h3>Посты объекта</h3>
                    <p>Пока нет постов для этого объекта</p>
                </section>
            )}

            <section className="scheduleSection">
                <h3>Сетевой график работ</h3>
                <div className="scheduleContainer">
                    <div className="schedulePlaceholder">
                        Сетевой график будет реализован в ближайшее время
                    </div>
                </div>
            </section>

            <section className="workCompositionSection">
                <button className="compositionBtn" onClick={handleShowWorkComposition}>
                    {hasWorkComposition ? '📥 Скачать состав работ' : 
                     compositionFile ? `✅ Состав работ загружен: ${compositionFile.name}` : '📤 Загрузить состав работ'}
                </button>
                
                <input
                    type="file"
                    ref={compositionFileInputRef}
                    onChange={handleCompositionFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
            </section>

            <section className="workersSection">
                <div className="workersHeader">
                    <h3>Работа на строительной площадке</h3>
                    <button className="addWorkerBtn" onClick={handleAddWorker}>
                        + Добавить участника
                    </button>
                </div>
                
                <div className="workersGrid">
                    {project.users && project.users.length > 0 ? (
                        project.users.map((user: User) => (
                            <WorkCard 
                                key={user.id} 
                                user={user}
                                onReview={handleUserReview}
                            />
                        ))
                    ) : (
                        <p className="noWorkers">Нет назначенных участников</p>
                    )}
                </div>
            </section>
        </div>
    );
}

export default ObjectForInspector;