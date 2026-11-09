import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('foods')
export class Food {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column() // যেমন: 'মিষ্টি', 'ভাতের খাবার', 'স্ট্রিট ফুড'
  category: string;

