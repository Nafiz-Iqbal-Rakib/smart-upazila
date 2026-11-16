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

  @Column({ type: 'enum', enum: ListingType })
  type: ListingType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}

