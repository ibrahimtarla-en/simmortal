import { Entity, PrimaryColumn, JoinColumn, OneToOne, Column } from 'typeorm';
import { MemorialEntity } from './MemorialEntity';
import { TimelineMemory } from 'src/memorial/interface/memorial.interface';

@Entity('memorial_timeline')
export class MemorialTimelineEntity {
  @PrimaryColumn('uuid', { name: 'memorial_id' })
  memorialId: string;

  @Column({ type: 'jsonb', nullable: false })
  timeline: TimelineMemory[];

  @OneToOne(() => MemorialEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'memorial_id' })
  memorial: MemorialEntity;
}
