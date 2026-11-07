import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('emergency_contacts')
export class EmergencyContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceName: string;

