import api from "./api";
import { type ConstructionProject, type CreateProjectRequest, type ApiResponse } from './types';

class ProjectService {
    // GET-запрос - получение всех проектов
    async getProjects(): Promise<ConstructionProject[]> {
        try {
            const res = await api.get<ApiResponse<ConstructionProject[]>>('/projects');
            return res.data.data;
        } catch (error) {
            console.error('Error fetching projects: ', error);
            throw error;
        }
    }
    // GET-запрос - получение одного проекта по айди
    async getProjectById(id: number): Promise<ConstructionProject>{
        try {
            const res = await api.get<ApiResponse<ConstructionProject>>(`/projects/${id}`);
            return res.data.data;
        } catch (error) {
            console.error('Error fetching project: ', error);
            throw error;
        }
    }
    // POST-запрос - создание нового проекта
    async createProject(projectData: CreateProjectRequest): Promise<ConstructionProject> {
        try {
            const res = await api.post<ApiResponse<ConstructionProject>>('/projects',projectData);
            return res.data.data;
        } catch (error) {
            console.error('Error creating project: ', error);
            throw error;
        }
    }
    // PUT-запрос - обновление уже существующего проекта
    async updateProject(id: number, projectData: Partial<ConstructionProject>): Promise<ConstructionProject> {
        try {
            const res = await api.put<ApiResponse<ConstructionProject>>(`/projects/${id}`, projectData);
            return res.data.data;
        } catch (error) {
            console.error('Error updating project: ', error);
            throw error;
        }
    }
    // DELETE-запрос - удаление проекта
    async deleteProject(id: number): Promise<void> {
        try {
            await api.delete(`/projects/${id}`);
        } catch (error) {
            console.error('Error deleting project: ', error);
            throw error;
        }
    }
    // GET-запрос - получение координат проекта 
    async getProjectCoordinates(id: number): Promise<[number, number][]> {
        try {
            const project = await this.getProjectById(id);
            return project.coordinates; 
        } catch (error) {
            console.error('Error fetching project coordinates:', error);
            throw error;
        }
    }
    // PUT-запрос - обновление координат проекта 
    async updateProjectCoordinates(projectId: number, coordinates: [number, number][]): Promise<ConstructionProject> {
        try {
            // Обновляем только координаты проекта
            const res = await api.put<ApiResponse<ConstructionProject>>(`/projects/${projectId}`, { 
                coordinates: coordinates 
            });
            return res.data.data;
        } catch (error) {
            console.error('Error updating project coordinates: ', error);
            throw error;
        }
    }
}

export const projectService = new ProjectService();