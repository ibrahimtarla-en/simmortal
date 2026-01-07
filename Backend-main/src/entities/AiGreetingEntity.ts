import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MemorialEntity } from './MemorialEntity';
import { AiGreetingState } from 'src/ai/interface/ai.interface';

@Entity('ai_greeting')
export class AiGreetingEntity {
  @PrimaryColumn('uuid', { name: 'memorial_id' })
  @ManyToOne(() => MemorialEntity)
  @JoinColumn({ name: 'memorial_id' })
  memorialId: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'last_updated',
    default: () => 'now()',
  })
  lastUpdated: Date;

  @Column({ type: 'text', nullable: true, name: 'audio_path' })
  audioPath: string | null;

  @Column({ type: 'text', nullable: true, name: 'image_path' })
  imagePath: string | null;

  @Column({ type: 'text', nullable: true, name: 'video_path' })
  videoPath: string | null;

  @Column({
    type: 'enum',
    enum: AiGreetingState,
    default: AiGreetingState.READY,
  })
  state: AiGreetingState;
}
