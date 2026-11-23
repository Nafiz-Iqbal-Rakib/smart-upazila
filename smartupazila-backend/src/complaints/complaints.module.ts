import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from './complaint.entity';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { AiRouterModule } from '../ai/ai-router.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Complaint]),
    AiRouterModule,
    CloudinaryModule,
  ],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
