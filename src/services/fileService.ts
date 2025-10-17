import api from './api';
import type { AxiosError } from 'axios';

export interface FileUploadResponse {
  message: string;
  fileUrl?: string;
}

class FileService {
  async uploadAct(objectId: number, file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file); 

    const response = await api.post<FileUploadResponse>(
      `/objects/${objectId}/act/`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      }
    );
    return response.data;
  }

  async downloadAct(objectId: number): Promise<Blob> {
    const response = await api.get(`/objects/${objectId}/act/`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async checkActExists(objectId: number): Promise<boolean> {
    try {
      await this.downloadAct(objectId);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      throw error;
    }
  }

  async uploadWorkComposition(objectId: number, file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file); 

    const response = await api.post<FileUploadResponse>(
      `/objects/${objectId}/works/`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async downloadWorkComposition(objectId: number): Promise<Blob> {
    const response = await api.get(`/objects/${objectId}/works/`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async checkWorkCompositionExists(objectId: number): Promise<boolean> {
    try {
      await this.downloadWorkComposition(objectId);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          return false;
        }
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

  getFileNameFromHeaders(headers: Record<string, string>): string {
    const contentDisposition = headers['content-disposition'];
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch && fileNameMatch[1]) {
        return fileNameMatch[1];
      }
    }
    return 'document.pdf';
  }
}

export const fileService = new FileService();