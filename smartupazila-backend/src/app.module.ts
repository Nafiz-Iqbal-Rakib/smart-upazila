import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { EmergencyModule } from './emergency/emergency.module';
import { BloodDonorsModule } from './blood-donors/blood-donors.module';
import { FoodsModule } from './foods/foods.module';
import { PlacesModule } from './places/places.module';
import { CommunityModule } from './community/community.module';
import { AiModule } from './ai/ai.module';
import { AiRouterModule } from './ai/ai-router.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UsersModule } from './users/users.module';
import { NoticesModule } from './notices/notices.module';
import { Notice } from './notices/notice.entity';

import { User } from './users/user.entity';
import { Complaint } from './complaints/complaint.entity';
import { EmergencyContact } from './emergency/emergency-contact.entity';
import { BloodDonor } from './blood-donors/blood-donor.entity';
import { Food } from './foods/food.entity';
import { Place } from './places/place.entity';
import { CommunityListing } from './community/community-listing.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const dbSsl = configService.get<string>('DB_SSL');
        const useSsl =
          dbSsl === 'true' ||
          Boolean(
            databaseUrl &&
              (databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=require')),
          );

        return {
          type: 'postgres',
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
                username: configService.get<string>('DB_USERNAME', 'postgres'),
                password: configService.get<string>('DB_PASSWORD', 'postgres'),
                database: configService.get<string>('DB_NAME', 'smartupazila_db'),
              }),
          ssl: useSsl ? { rejectUnauthorized: false } : false,
