import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiRouterModule } from './ai-router.module';
import { AiAssistantService } from './ai-assistant.service';
import { AiController } from './ai.controller';
import { EmergencyModule } from '../emergency/emergency.module';
import { BloodDonorsModule } from '../blood-donors/blood-donors.module';
import { FoodsModule } from '../foods/foods.module';
import { PlacesModule } from '../places/places.module';
import { ComplaintsModule } from '../complaints/complaints.module';
import { User } from '../users/user.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    TypeOrmModule.forFeature([User]),
    AiRouterModule,
    EmergencyModule,
    BloodDonorsModule,
    FoodsModule,
    PlacesModule,
    ComplaintsModule,
  ],
  controllers: [AiController],
  providers: [AiAssistantService],
  exports: [AiAssistantService],
})
export class AiModule {}
