import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloodDonor } from './blood-donor.entity';
import { BloodDonorsService } from './blood-donors.service';
import { BloodDonorsController } from './blood-donors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BloodDonor])],
  controllers: [BloodDonorsController],
  providers: [BloodDonorsService],
  exports: [BloodDonorsService],
})
export class BloodDonorsModule {}

