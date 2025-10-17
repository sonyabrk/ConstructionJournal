import api from './api';
import { type Post, type CreatePostRequest } from './types';

class PostService {
    async createPost(postData: CreatePostRequest): Promise<Post> {
        try {
            const formData = new FormData();
            
            formData.append('title', postData.title);
            formData.append('content', postData.content);
            formData.append('author', postData.author.toString());
            formData.append('object', postData.object.toString());
            
            if (postData.files && postData.files.length > 0) {
                postData.files.forEach((file) => {
                    formData.append('files', file);
                });
            }
            
            const res = await api.post<Post>(
                `/objects/${postData.object}/create_post/`, 
                formData
            );
            return res.data;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    async getPostById(objectId: number, postId: number): Promise<Post> {
        try {
            const res = await api.get<Post>(`/objects/${objectId}/${postId}/`);
            return res.data;
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }

    async updatePost(objectId: number, postId: number, postData: Partial<Post>): Promise<Post> {
        try {
            const res = await api.put<Post>(`/objects/${objectId}/${postId}/`, postData);
            return res.data;
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    }

    async deletePost(objectId: number, postId: number): Promise<void> {
        try {
            await api.delete(`/objects/${objectId}/${postId}/`);
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }
}

export const postService = new PostService();