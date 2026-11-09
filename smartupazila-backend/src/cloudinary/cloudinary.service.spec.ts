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
