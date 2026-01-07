import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { MemorialEntity } from './MemorialEntity';

@Entity('memorial_view_log')
@Index(['memorialId', 'ipHash', 'viewedAt']) // Use property names, not column names
@Index(['memorialId']) // For counting views
export class MemorialViewLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'memorial_id' })
  memorialId: string;

  @ManyToOne(() => MemorialEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'memorial_id' })
  memorial: MemorialEntity;

  @Column({ name: 'ip_hash', type: 'text' })
  ipHash: string;

  @CreateDateColumn({ name: 'viewed_at', type: 'timestamptz', default: () => 'now()' })
  viewedAt: Date;
}
