import { Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Complaint } from '../complaints/complaint.entity';
import { Role } from './role.enum';
import { Department } from './department.enum';

export { Role, Department };

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ unique: true, nullable: true })
  email: string | null;

  @Column({ unique: true, nullable: true })
  nid: string | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({ nullable: true })
  avatarUrl: string | null;
