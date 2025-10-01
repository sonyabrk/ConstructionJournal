import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ObjectCard from '../components/ObjectCard';
import { type ConstructionProject } from '../services/types';
import { projectService } from '../services/projectService';

const ObjectsPage = () => {
    const [projects, setProjects] = useState<ConstructionProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const projectsData = await projectService.getProjects();
                setProjects(projectsData);
                
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);
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
                <h1 className="myObjects">Мои объекты</h1>

                <div className="searchAndActions">
                    <div className="searchObject">
                        <input
                            type="text"
                            placeholder="поиск объекта..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => console.log('Сканирование...')}
                        className="scanBtn"
                    >Сканер</button>

                    <button
                        onClick={() => setFilterActive(!filterActive)}
                        className="filterBtn"
                    >Фильтр</button>
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
                                    supervisionUserName={`Контроль #${project.supervision}`}
                                    constractorName={`Подрядчик #${project.constractor}`}
                                    address={`Координаты: ${project.coordinates[0]?.[0]?.toFixed(4)}, ${project.coordinates[0]?.[1]?.toFixed(4)}`}
                                />
                            ))
                        ) : (
                            <p className="textIfNot">
                                {searchTerm ? 'Объекты по вашему запросу не найдены' : 'Нет объектов для отображения'}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ObjectsPage;