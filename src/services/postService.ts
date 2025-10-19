import api from './api';
import { type Post, type CreatePostRequest } from './types';

class PostService {
    async createPost(postData: CreatePostRequest): Promise<Post> {
        try {
            const formData = new FormData();
            
            formData.append('title', postData.title);
            formData.append('content', postData.content);
            if (postData.author) {
                formData.append('author', postData.author.toString());
            }
            if (postData.object) {
                formData.append('object', postData.object.toString());
            }
            
            if (postData.files && postData.files.length > 0) {
                postData.files.forEach((file) => {
                    formData.append('files', file);
                });
            }
            
            const res = await api.post<Post>(
                `/objects/access/${postData.object}/create_post/`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
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

    async getPostsByObjectId(objectId: number): Promise<Post[]> {
        try {
            const res = await api.get<Post[]>(`/objects/${objectId}/posts/`);
            return res.data;
        } catch (error) {
            console.error('Error fetching posts for object:', error);
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

    async getPostFile(objectId: number, postId: number, fileName: string): Promise<Blob> {
        try {
            const res = await api.get<Blob>(`/objects/${objectId}/${postId}/file/`, {
                params: { file_name: fileName },
                responseType: 'blob'
            });
            return res.data;
        } catch (error) {
            console.error('Error fetching post file:', error);
            throw error;
        }
    }
}

export const postService = new PostService();