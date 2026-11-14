import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider.js';
import { CloudinaryService } from './cloudinary.service.js';

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    cloudinary.config({
      cloud_name: 'test_cloud',
      api_key: '1234567890',
      api_secret: 'test_secret_key',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const map: Record<string, string> = {
                CLOUDINARY_CLOUD_NAME: 'test_cloud',
                CLOUDINARY_API_KEY: '1234567890',
                CLOUDINARY_API_SECRET: 'test_secret_key',
              };
              return map[key];
            },
          },
        },
        {
          provide: CLOUDINARY,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('generates a signed authenticated HTTPS URL for private images', () => {
    const url = service.getSignedImageUrl('smartupazila/complaints/sample', 300);
    expect(url).toContain('https://res.cloudinary.com/test_cloud/image/authenticated/');
    expect(url).toMatch(/s--[A-Za-z0-9_-]+--/);
