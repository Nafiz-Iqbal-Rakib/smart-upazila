import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ListingType {
  SCHOOL = 'SCHOOL',
  COLLEGE = 'COLLEGE',
  MADARASA = 'MADARASA',
  LOCAL_BUSINESS = 'LOCAL_BUSINESS',
  CLINIC = 'CLINIC',
  FACILITY = 'FACILITY',
  OTHER = 'OTHER',
}

@Entity('community_listings')
export class CommunityListing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

