import api from './api';
import { type ApiResponse, type Material } from './types';

class MaterialService {
    // GET-запрос - получеение всех материалов
    async getProjectMaterials(pId: number): Promise<Material[]> {
        try {
            const res = await api.get<ApiResponse<Material[]>>(`/materials?projectId=${pId}`);
            return res.data.data;
        } catch (error) {
            console.error('Erorr fetching materials: ', error);
            throw error;
        }
    }
    // POST-запрос - добавление нового материала
    async addMaterial(material: Omit<Material, 'id'>): Promise<Material> {
        try {
            const res = await api.post<ApiResponse<Material>>('/materials', material);
            return res.data.data;
        } catch (error) {
            console.error('Error adding material:', error);
            throw error;
        }
    }
    // POST-запрос - загрузка документа (ТТН или паспорта качества)
    async uploadDocument(file: File, materialId: number, type: 'ttn' | 'quality'): Promise<{ url: string }> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('materialId', materialId.toString());
            formData.append('type', type);

            const res = await api.post<ApiResponse<{ url: string }>>('/upload-document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return res.data.data;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    }
}

export const materialService = new MaterialService();
