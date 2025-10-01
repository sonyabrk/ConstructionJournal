import { type ConstructionProject } from '../services/types';
import './ObjectCard.scss';

interface ObjectCardProps {
    project: ConstructionProject;
    constractorName?: string; 
    supervisionUserName?: string; 
    address?: string;
}

const ObjectCard = ({ project, constractorName, supervisionUserName, address }: ObjectCardProps) => {
    const firstCoordinate = project.coordinates.length > 0 ? project.coordinates[0] : null;

    const getStatusInfo = (status?: string) => {
        switch (status) {
            case 'active':
                return { text: 'Активный' };
            case 'completed':
                return { text: 'Завершенный' };
            case 'planned':
                return { text: 'Запланированный' };
            default:
                return { text: 'Неизвестно' };
        }
    };

    const statusInfo = getStatusInfo(project.status);

    return (
        <div className="mainObjectCard">
            <h3 className="nameObject">{project.name}</h3>

            {project.description && (
                <p className="descriptionObject">{project.description}</p>
            )}

            <div className="infoObject">
                {address && (
                    <div className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">📍</span>
                        <div>
                            <span className="text-gray-500">Адрес: </span>
                            <span className="text-gray-700">{address}</span>
                        </div>
                    </div>
                )}

                {firstCoordinate && (
                    <div className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">🌐</span>
                        <div>
                            <span className="text-gray-500">Координаты: </span>
                            <span className="text-gray-700">
                                {firstCoordinate[0].toFixed(6)}, {firstCoordinate[1].toFixed(6)}
                            </span>
                        </div>
                    </div>
                )}

                {supervisionUserName && (
                    <div className="supervisObject">
                        <span className="text-gray-400 mt-0.5">👨‍💼</span>
                        <div>
                            <span className="text-gray-500">Контроль: </span>
                            <span className="text-gray-700">{supervisionUserName}</span>
                        </div>
                    </div>
                )}

                {constractorName && (
                    <div className="constractObject">
                        <span className="text-gray-400 mt-0.5">👷</span>
                        <div>
                            <span>Подрядчик (ответственный): </span>
                            <span>{constractorName}</span>
                        </div>
                    </div>
                )}

                <span>{statusInfo.text}</span>
            </div>
            <button className="objectDetailsBtn">Обзор</button>
        </div>
    );
};

export default ObjectCard;