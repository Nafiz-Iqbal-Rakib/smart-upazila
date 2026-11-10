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

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @Column({ unique: true })
  trackingId: string;

  // কোন officer কে assign করা হয়েছে
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedTo' })
  assignedTo: User | null;

  // কোন admin/officer complaint-টা review/update করেছে
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewedBy' })
  reviewedBy: User | null;

  // অ্যাডমিন বা দায়িত্বপ্রাপ্ত কর্মকর্তার সমাধান মন্তব্য / প্রগ্রেস নোট
  @Column({ type: 'text', nullable: true })
  adminRemark: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
