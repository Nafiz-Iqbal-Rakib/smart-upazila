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

  @Column({ default: false })
  isAreaSpecial: boolean; // এই এলাকার বিখ্যাত/স্পেশাল খাবার কিনা

  @Column({ nullable: true })
  priceRange: string; // যেমন: '৫০-১৫০ টাকা'

  @Column()
  address: string;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}

