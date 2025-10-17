import api from "./api";
import { type ConstructionProject, type CreateProjectRequest, type ApiResponse } from './types';
import { geoService } from "./geoService";

class ProjectService {
    // GET-запрос - получение всех проектов
    async getProjects(): Promise<ConstructionProject[]> {
        try {
            const res = await api.get<ConstructionProject[]>('/objects/my_objects/');
            return res.data;
        } catch (error) {
            console.error('Error fetching projects: ', error);
            throw error;
        }
    }

    // GET-запрос - получение одного проекта по айди
    async getProjectById(id: number): Promise<ConstructionProject>{
        try {
            const res = await api.get<ConstructionProject>(`/objects/${id}/`);
            return res.data;
        } catch (error) {
            console.error('Error fetching project: ', error);
            throw error;
        }
    }
    // POST-запрос - создание нового проекта
    async createProject(projectData: CreateProjectRequest): Promise<ConstructionProject> {
        try {
            const res = await api.post<ConstructionProject>('/objects/my_objects/',projectData);
            return res.data;
        } catch (error) {
            console.error('Error creating project: ', error);
            throw error;
        }
    }
    // PUT-запрос - обновление уже существующего проекта
    async updateProject(id: number, projectData: Partial<ConstructionProject>): Promise<ConstructionProject> {
        try {
            const res = await api.put<ApiResponse<ConstructionProject>>(`/objects/${id}`, projectData);
            return res.data.data;
        } catch (error) {
            console.error('Error updating project: ', error);
            throw error;
        }
    }
    // DELETE-запрос - удаление проекта
    async deleteProject(id: number): Promise<void> {
        try {
            await api.delete(`/objects/my_objects/${id}`);
        } catch (error) {
            console.error('Error deleting project: ', error);
            throw error;
        }
    }
    // GET-запрос - получение координат проекта 
    // async getProjectCoordinates(id: number): Promise<[number, number][]> {
    //     try {
    //         const project = await this.getProjectById(id);
    //         return project.coordinates; 
    //     } catch (error) {
    //         console.error('Error fetching project coordinates:', error);
    //         throw error;
    //     }
    // }
    // Обновите другие методы для работы с новым форматом координат
    async getProjectCoordinates(id: number): Promise<[number, number][]> {
        try {
            const project = await this.getProjectById(id);
            // Преобразуем {x, y} в [number, number]
            return project.coordinates.map(coord => [coord.x, coord.y]);
        } catch (error) {
            console.error('Error fetching project coordinates:', error);
            throw error;
        }
    }
    // PUT-запрос - обновление координат проекта 
    async updateProjectCoordinates(projectId: number, coordinates: [number, number][]): Promise<ConstructionProject> {
        try {
            // Обновляем только координаты проекта
            const res = await api.put<ApiResponse<ConstructionProject>>(`/objects/my_objects/${projectId}`, { 
                coordinates: coordinates 
            });
            return res.data.data;
        } catch (error) {
            console.error('Error updating project coordinates: ', error);
            throw error;
        }
    }
    // проверка (находится ли пользователь на территории проекта)
    async isUserOnProject(projectId: number): Promise<boolean> {
        try {
            const project = await this.getProjectById(projectId);
            const userCoords = await geoService.getCurrentPosition();
            const polygonCoords: [number, number][] = project.coordinates.map(coord => [coord.x, coord.y]);
            
            return geoService.isPointInPolygon(userCoords, polygonCoords);
        } catch (error) {
            console.error('Error checking user location:', error);
            return false;
        }
    }

    // получение расстояния от пользователя до проекта
    async getDistanceToProject(projectId: number): Promise<number> {
        try {
            const project = await this.getProjectById(projectId);
            const userCoords = await geoService.getCurrentPosition();
            const firstCoord = project.coordinates[0];
            if (!firstCoord) {
                return -1;
            }
            const projectCenter: [number, number] = [firstCoord.x, firstCoord.y];
            return geoService.calculateDistance(userCoords, projectCenter);
        } catch (error) {
            console.error('Error calculating distance:', error);
            return -1;
        }
    }
    // В projectService.ts
    async debugGetProjects(): Promise<unknown> {
        try {
            console.log('🔍 DEBUG - Отправка запроса на /objects/my_objects/');
            const response = await api.get('/objects/my_objects/');
            console.log('📨 DEBUG - Полный ответ:', response);
            console.log('📊 DEBUG - Данные ответа:', response.data);
            console.log('🔧 DEBUG - Статус:', response.status);
            return response.data;
        } catch (error) {
            console.error('❌ DEBUG - Ошибка:', error);
            throw error;
        }
    }
}

export const projectService = new ProjectService();