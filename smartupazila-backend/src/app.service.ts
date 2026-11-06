import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'ok',
      service: 'Smart Upazila AI API',
      version: '1.0',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }
}
