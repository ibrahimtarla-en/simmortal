import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { MemorialEntity } from './MemorialEntity';

@Entity('memorial_location')
export class MemorialLocationEntity {
  @PrimaryColumn('uuid', { name: 'memorial_id' })
  memorialId: string;

  @Column('double precision')
  latitude: number;

  @Column('double precision')
  longitude: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;

  @OneToOne(() => MemorialEntity)
  @JoinColumn({ name: 'memorial_id' })
  memorial: MemorialEntity;
}
