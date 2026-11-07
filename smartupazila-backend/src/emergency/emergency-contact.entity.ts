import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('emergency_contacts')
export class EmergencyContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceName: string;

  @Column() // Emergency / Police / Hospital / Fire / Administration
  category: string;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;
}

