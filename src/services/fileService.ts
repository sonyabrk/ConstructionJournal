import api from './api';
import type { AxiosError } from 'axios';

export interface FileUploadResponse {
  message: string;
  fileUrl?: string;
}

class FileService {
  async uploadAct(objectId: number, file: File): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<FileUploadResponse>(
        `/objects/${objectId}/act/`, 
        formData
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 400) {
          throw new Error('ACT_ALREADY_EXISTS'); // Специальный код ошибки
        }
        if (axiosError.response?.status === 404) {
          throw new Error('OBJECT_NOT_FOUND');
        }
      }
      throw new Error('UPLOAD_FAILED');
    }
  }

  async uploadWorkComposition(objectId: number, file: File, replace: boolean = false): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (replace) {
        formData.append('replace', 'true');
      }

      const response = await api.post<FileUploadResponse>(
        `/objects/${objectId}/works/`, 
        formData
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 400) {
          throw new Error(replace ? 'REPLACE_FAILED' : 'COMPOSITION_ALREADY_EXISTS');
        }
        if (axiosError.response?.status === 404) {
          throw new Error('OBJECT_NOT_FOUND');
        }
      }
      throw new Error('UPLOAD_FAILED');
    }
  }

  async deleteWorkComposition(objectId: number): Promise<void> {
    try {
      await api.delete(`/objects/${objectId}/works/`);
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          throw new Error('COMPOSITION_NOT_FOUND');
        }
      }
      throw new Error('DELETE_FAILED');
    }
  }

  async downloadAct(objectId: number): Promise<Blob> {
    try {
      const response = await api.get(`/objects/${objectId}/act/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          throw new Error('ACT_NOT_FOUND');
        }
      }
      throw new Error('DOWNLOAD_FAILED');
    }
  }

  async downloadWorkComposition(objectId: number): Promise<Blob> {
    try {
      const response = await api.get(`/objects/${objectId}/works/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          throw new Error('COMPOSITION_NOT_FOUND');
        }
      }
      throw new Error('DOWNLOAD_FAILED');
    }
  }

  async checkActExists(objectId: number): Promise<boolean> {
    try {
      await this.downloadAct(objectId);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'ACT_NOT_FOUND') {
        return false;
      }
      throw error;
    }
  }

  async checkWorkCompositionExists(objectId: number): Promise<boolean> {
    try {
      await this.downloadWorkComposition(objectId);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'COMPOSITION_NOT_FOUND') {
        return false;
      }
      throw error;
    }
  }

  downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const fileService = new FileService();