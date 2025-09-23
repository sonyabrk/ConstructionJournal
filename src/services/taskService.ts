import api  from './api';
import { type ApiResponse, type Task, type Issue } from './types';

class TaskService {
    // GET-запрос - получение задач по проекту
    async getProjectTasks(projectId: number): Promise<Task[]> {
        try {
            const res = await api.get<ApiResponse<Task[]>>(`/tasks?projectId=${projectId}`);
            return res.data.data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    }
    // POST-запрос - создание задачи
    async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
        try {
            const res = await api.post<ApiResponse<Task>>('/tasks', task);
            return res.data.data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }
    // PATCH-запрос - обновление статуса задачи
    async updateTaskStatus(taskId: number, status: Task['status']): Promise<Task> {
        try {
            const res = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}`, { status });
            return res.data.data;
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    }
    // GET-запрос - получение замечаний по проекту
    async getProjectIssues(projectId: number): Promise<Issue[]> {
        try {
            const res = await api.get<ApiResponse<Issue[]>>(`/issues?projectId=${projectId}`);
            return res.data.data;
        } catch (error) {
            console.error('Error fetching issues:', error);
            throw error;
        }
    }
    // POST-запрос - создание замечания
    async createIssue(issue: Omit<Issue, 'id' | 'createdAt'>): Promise<Issue> {
        try {
            const res = await api.post<ApiResponse<Issue>>('/issues', issue);
            return res.data.data;
        } catch (error) {
            console.error('Error creating issue:', error);
            throw error;
        }
    }
    // PATCH-запрос - обновление статуса замечания
    async updateIssueStatus(issueId: number, status: Issue['status']): Promise<Issue> {
        try {
            const res = await api.patch<ApiResponse<Issue>>(`/issues/${issueId}`, { status });
            return res.data.data;
        } catch (error) {
            console.error('Error updating issue status:', error);
            throw error;
        }
    }
}

export const taskService = new TaskService();