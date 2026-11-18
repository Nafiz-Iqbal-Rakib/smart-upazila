import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Complaint } from '../complaints/complaint.entity';
import { EmergencyContact } from '../emergency/emergency-contact.entity';
import { BloodDonor } from '../blood-donors/blood-donor.entity';
import { Food } from '../foods/food.entity';
import { Place } from '../places/place.entity';
import { CommunityListing } from '../community/community-listing.entity';
import { Notice } from '../notices/notice.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Complaint,
      EmergencyContact,
      BloodDonor,
      Food,
      Place,
      CommunityListing,
      Notice,
    ]),
    CloudinaryModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
