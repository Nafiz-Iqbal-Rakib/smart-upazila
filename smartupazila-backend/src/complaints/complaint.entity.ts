import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from '../users/department.enum';
import { User } from '../users/user.entity';

export enum Status {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum Urgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY',
}

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.complaints, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  category: string;

  @Column({ type: 'enum', enum: Department, default: Department.OTHER })
  department: Department;

  @Column({ type: 'enum', enum: Urgency, default: Urgency.MEDIUM })
  urgency: Urgency;

  @Column('text')
  description: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  imagePublicId: string | null;

