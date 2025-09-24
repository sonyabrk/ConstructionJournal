import api from './api';
import { type Post, type CreatePostRequest, type ApiResponse } from './types';
import { geoService } from './geoService';
import { offlineService } from './offlineService';

class PostService {
    async createPost(postData: CreatePostRequest, addLocation: boolean = true): Promise<Post> {
        try {
            let finalPostData = { ...postData };
            
            if (addLocation) {
                try {
                    const userCoords = await geoService.getCurrentPosition();
                    // Добавляем координаты к данным поста, если API поддерживает
                    finalPostData = { 
                        ...postData, 
                        coordinates: userCoords // предполагая, что API принимает coordinates
                    };
                } catch (error) {
                    console.warn('Could not get user location:', error);
                    // Продолжаем без геолокации
                }
            }
            
            const res = await api.post<ApiResponse<Post>>('/posts', finalPostData);
            return res.data.data;
        } catch (error) {
            console.error('Error creating post:', error);
            
            // Сохраняем в оффлайн-очередь при ошибке сети
            if (!navigator.onLine) {
                await offlineService.saveAction('CREATE_POST', postData);
                throw new Error('Post saved for offline synchronization');
            }
            
            throw error;
        }
    }

    // Остальные методы остаются без изменений
    async getProjectPosts(projectId: number): Promise<Post[]> {
        try {
            const res = await api.get<ApiResponse<Post[]>>(`/posts?projectId=${projectId}`);
            return res.data.data;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }

    async updatePost(id: number, postData: Partial<Post>): Promise<Post> {
        try {
            const res = await api.put<ApiResponse<Post>>(`/posts/${id}`, postData);
            return res.data.data;
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    }

    async deletePost(id: number): Promise<void> {
        try {
            await api.delete(`/posts/${id}`);
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }
}

export const postService = new PostService();