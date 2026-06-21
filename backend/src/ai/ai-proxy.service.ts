import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AiProxyService {
  private client: AxiosInstance;

  constructor(private config: ConfigService) {
    this.client = axios.create({
      baseURL: this.config.get('AI_SERVICE_URL', 'http://localhost:8000'),
      timeout: 30000,
    });
  }

  private async request<T>(path: string, data: unknown): Promise<T> {
    try {
      const response = await this.client.post(path, data);
      return response.data;
    } catch (error) {
      throw new ServiceUnavailableException('AI service unavailable');
    }
  }

  symptomCheck(data: unknown) {
    return this.request('/api/v1/symptom-checker', data);
  }

  medicalChat(data: unknown) {
    return this.request('/api/v1/medical-chat', data);
  }

  summarizeReport(data: unknown) {
    return this.request('/api/v1/report-summarize', data);
  }

  recommendDoctors(data: unknown) {
    return this.request('/api/v1/doctor-recommendation', data);
  }
}
