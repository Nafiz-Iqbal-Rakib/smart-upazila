import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum NoticeCategory {
  GENERAL = 'GENERAL',
  ELECTRICITY = 'ELECTRICITY',
  AGRICULTURE = 'AGRICULTURE',
  HEALTH = 'HEALTH',
  EMERGENCY = 'EMERGENCY',
  EDUCATION = 'EDUCATION',
  DEVELOPMENT = 'DEVELOPMENT',
}

export enum NoticePriority {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

@Entity('notices')
export class Notice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;
