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

  @Column({
    type: 'enum',
    enum: NoticeCategory,
    default: NoticeCategory.GENERAL,
  })
  category: NoticeCategory;

  @Column({
    type: 'enum',
    enum: NoticePriority,
    default: NoticePriority.NORMAL,
  })
  priority: NoticePriority;

  @Column({ nullable: true })
  imageUrl: string | null;

  @Column({ nullable: true })
  pdfUrl: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
