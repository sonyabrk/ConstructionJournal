import { useNavigate } from 'react-router-dom';
import { type ConstructionProject } from '../services/types';
import './ObjectCard.scss';

interface ObjectCardProps {
    project: ConstructionProject;
    constractorName?: string; 
    supervisionUserName?: string; 
    address?: string;
    currentUserRole?: string; 
}

const ObjectCard = ({ project, currentUserRole }: ObjectCardProps) => {
    const navigate = useNavigate();
    const firstCoordinate = project.coordinates.length > 0 ? project.coordinates[0] : null;

    const getStatusInfo = (status?: string) => {
        switch (status) {
            case 'active':
                return { text: 'Активный', className: 'status-active' };
            case 'completed':
                return { text: 'Завершенный', className: 'status-completed' };
            case 'planned':
                return { text: 'Запланированный', className: 'status-planned' };
            default:
                return { text: 'Неизвестно', className: 'status-unknown' };
        }
    };

    const statusInfo = getStatusInfo(project.status);

    const handleReviewClick = () => {
        if (project.id) {
            navigate(`/objects/${project.id}/`);
        }
    };

    // ролевая информации
    const renderRoleSpecificInfo = () => {
        switch (currentUserRole) {
            case 'ROLE_CONTRACTOR':
                return <div className="role-badge contractor-badge">Ваш объект</div>;
            case 'ROLE_SUPERVISION':
                return <div className="role-badge supervision-badge">Под надзором</div>;
            case 'ROLE_INSPECTOR':
                return <div className="role-badge inspector-badge">Для проверки</div>;
            case 'ROLE_ADMIN':
                return <div className="role-badge admin-badge">Администрирование</div>;
            default:
                return null;
        }
    };

    return (
        <div className="mainObjectCard">
            <div className="card-header">
                <h3 className="nameObject">{project.name}</h3>
                {renderRoleSpecificInfo()}
            </div>

            {project.description && (
                <p className="descriptionObject">{project.description}</p>
            )}

            <div className="infoObject">
                {firstCoordinate && (
                    <div className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">📍</span>
                        <div>
                            <span className="text-gray-500">Координаты: </span>
                            <span className="text-gray-700">
                                {firstCoordinate.x.toFixed(6)}, {firstCoordinate.y.toFixed(6)}
                            </span>
                        </div>
                    </div>
                )}

                {project.responsibleSupervision && (
                    <div className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">👨‍💼</span>
                        <div>
                            <span className="text-gray-500">Контроль: </span>
                            <span className="text-gray-700">
                                {project.responsibleSupervision.username} ({project.responsibleSupervision.position})
                            </span>
                        </div>
                    </div>
                )}

                {project.responsibleContractor && (
                    <div className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">👷</span>
                        <div>
                            <span className="text-gray-500">Подрядчик: </span>
                            <span className="text-gray-700">
                                {project.responsibleContractor.username} ({project.responsibleContractor.position})
                            </span>
                        </div>
                    </div>
                )}

                <div className={`status-badge ${statusInfo.className}`}>
                    {statusInfo.text}
                </div>
            </div>
            <button 
                className="objectDetailsBtn" 
                onClick={handleReviewClick}
            >
                Обзор
            </button>
        </div>
    );
};

export default ObjectCard;