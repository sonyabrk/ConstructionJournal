import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type ConstructionProject, type User } from '../services/types';
import WorkCard from '../components/WorkCard';
import Header from "../components/Header";
import MapComponent from '../components/MapComponent';
import { projectService } from '../services/projectService';

const ObjectForInspector = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<ConstructionProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                setLoading(true);
                if (!projectId) {
                    throw new Error('ID проекта не указан');
                }
                
                const projectData = await projectService.getProjectById(Number(projectId));
                setProject(projectData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка загрузки');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProjectData();
        }
    }, [projectId]);

    const handleOpenAct = () => {
        console.log('Открытие акта объекта', projectId);
    };

    const handleShowWorkComposition = () => {
        console.log('Состав работ объекта', projectId);
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
        ? `Координаты: ${project.coordinates[0]}, ${project.coordinates[1]}`
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
                    </span>
                </div>
            </section>

            <section className="actionsSection">
                <button className="actBtn" onClick={handleOpenAct}>
                    Акт открытия объекта
                </button>
            </section>

            {/* добавить сетевой график */}
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
                    Состав работ
                </button>
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

