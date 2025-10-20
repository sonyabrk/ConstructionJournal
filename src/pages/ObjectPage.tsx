import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ObjectCard from '../components/ObjectCard';
import QrScanner from '../components/QrScanner';
import ScanBtn from '../assets/scaner.svg';
import FilterBtn from '../assets/filter.svg';
import { type ConstructionProject, type User } from '../services/types';
import { projectService } from '../services/projectService';
import './ObjectPage.scss';
import './reset.scss';

interface ObjectPageProps {
  currentUser?: User | null;
}

const ObjectPage = ({ currentUser }: ObjectPageProps) => {
    const [projects, setProjects] = useState<ConstructionProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const navigate = useNavigate();

    // возможности на основе роли
    const userRole = currentUser?.role;
    const isContractor = userRole === 'ROLE_CONTRACTOR';
    const isSupervision = userRole === 'ROLE_SUPERVISION';
    const isInspector = userRole === 'ROLE_INSPECTOR';
    //const isAdmin = userRole === 'ROLE_ADMIN';

    // Определяем заголовок в зависимости от роли
    const getPageTitle = () => {
        switch (userRole) {
            case 'ROLE_CONTRACTOR':
                return 'Мои объекты';
            case 'ROLE_SUPERVISION':
                return 'Объекты под надзором';
            case 'ROLE_INSPECTOR':
                return 'Объекты для проверки';
            case 'ROLE_ADMIN':
                return 'Все объекты системы';
            default:
                return 'Объекты';
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const projectsData = await projectService.getProjects();
                console.log(projectsData);
                setProjects(projectsData);
                
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleQrScanned = (projectId: number) => {
        console.log('QR scanned for project:', projectId);
        // Перенаправляем на страницу объекта
        navigate(`/object/${projectId}`);
    };

    const handleScanClick = () => {
        setIsScannerOpen(true);
    };

    const filteredProjects = (projects || []).filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="allObjects">
            <Header />
            <div className="container mx-auto px-4 py-6">
                <div className='titleAndActionsContainer'>
                    <h1 className="myObjects">{getPageTitle()}</h1>

                    <div className="searchAndActions">
                        <div className="searchObject">
                            <input
                                type="text"
                                placeholder="Поиск объекта..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleScanClick}
                            className="scanBtn"
                            title="Сканировать QR-код"
                        >
                            <img src={ScanBtn} alt="Сканер" width="30" height="30" />
                        </button>

                        <button
                            onClick={() => setFilterActive(!filterActive)}
                            className="filterBtn"
                        >
                            <img src={FilterBtn} alt="Фильтр" width="30" height="30" />
                        </button>
                    </div>
                </div>

                {filterActive && (
                    <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">Все</option>
                                    <option value="active">Активные</option>
                                    <option value="completed">Завершенные</option>
                                    <option value="planned">Запланированные</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="loadingObjects">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <ObjectCard 
                                    key={project.id}
                                    project={project}
                                    currentUserRole={userRole}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8">
                                <p className="textIfNot">
                                    {searchTerm ? 'Объекты по вашему запросу не найдены' : 'Нет объектов для отображения'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Дополнительная информация для разных ролей */}
                {isContractor && filteredProjects.length === 0 && !searchTerm && (
                    <div className="role-info contractor-info">
                        <p>У вас пока нет созданных объектов. Начните с создания нового объекта.</p>
                        <button className="create-first-project">Создать первый объект</button>
                    </div>
                )}

                {isInspector && filteredProjects.length === 0 && !searchTerm && (
                    <div className="role-info inspector-info">
                        <p>На данный момент нет объектов, назначенных для вашей проверки.</p>
                    </div>
                )}

                {isSupervision && filteredProjects.length === 0 && !searchTerm && (
                    <div className="role-info inspector-info">
                        <p>На данный момент нет объектов, назначенных для вашей проверки.</p>
                    </div>
                )}

                <QrScanner
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onQrScanned={handleQrScanned}
                />
            </div>
        </div>
    );
};

export default ObjectPage;

