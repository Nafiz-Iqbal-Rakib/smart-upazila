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
