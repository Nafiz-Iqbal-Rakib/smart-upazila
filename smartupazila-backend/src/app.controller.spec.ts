import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API health status object', () => {
      const res = appController.getHello();
      expect(res.status).toBe('ok');
      expect(res.service).toBe('Smart Upazila AI API');
      expect(res.docs).toBe('/api/docs');
    });
  });
});
