import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ObjectCard from '../components/ObjectCard';
import ScanBtn from '../assets/scaner.svg';
import FilterBtn from '../assets/filter.svg';
import { type ConstructionProject } from '../services/types';
import { projectService } from '../services/projectService';
import './ObjectPage.scss';
import './reset.scss';

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
                    <h1 className="myObjects">Мои объекты</h1>

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
                            onClick={() => console.log('Сканирование...')}
                            className="scanBtn"
                        ><img src={ScanBtn} alt="Сканер" width="30" height="30" />
                        </button>

                        <button
                            onClick={() => setFilterActive(!filterActive)}
                            className="filterBtn"
                        ><img src={FilterBtn} alt="Фильтр" width="30" height="30" />
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
            </div>
        </div>
    );
};

export default ObjectsPage;
