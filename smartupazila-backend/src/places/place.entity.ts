import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum PlaceCategory {
  HISTORICAL = 'HISTORICAL',
  TOURIST_SPOT = 'TOURIST_SPOT',
  PARK = 'PARK',
  RELIGIOUS = 'RELIGIOUS',
  OTHER = 'OTHER',
}

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: PlaceCategory, default: PlaceCategory.OTHER })
  category: PlaceCategory;

  @Column()
  address: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  entryFee: string; // যেমন: 'মুক্ত' / '২০ টাকা'

  @Column({ nullable: true })
  openingHours: string; // যেমন: 'সকাল ৯টা - সন্ধ্যা ৬টা'

  @CreateDateColumn()
  createdAt: Date;
}

