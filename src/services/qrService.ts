import api from './api';

class QrService {
  async generateQr(projectId: number): Promise<{ qr_data: string }> {
    try {
      const response = await api.post<{ qr_data: string }>('/qr/generate/', {
        project_id: projectId
      });
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
}

export const qrService = new QrService();