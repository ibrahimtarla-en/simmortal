import {
  Entity,
  CreateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { UserEntity } from './UserEntity';
import { MemorialEntity } from './MemorialEntity';
import {
  MemorialFlagReason,
  MemorialFlagStatus,
  MemorialFlagType,
} from 'src/memorial/interface/memorial.interface';
import { nullToUndefinedTransformer } from 'src/util/transformer';

@Entity('memorial_flag')
export class MemorialFlagEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'status_updated_at', default: () => 'now()' })
  statusUpdatedAt: Date;

  @Column('uuid', { name: 'user_id', nullable: true })
  userId: string | null;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column('uuid', { name: 'memorial_id' })
  memorialId: string;

  @OneToOne(() => MemorialEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'memorial_id' })
  memorial: MemorialEntity;

  @Column('uuid', { name: 'actor_id' })
  actorId: string;
  @OneToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor: UserEntity;

  @Column('uuid', { name: 'reference_id', nullable: false })
  referenceId: string;

  @Column('enum', {
    enum: MemorialFlagType,
    nullable: false,
    name: 'type',
    enumName: 'memorial_flag_type',
  })
  type: MemorialFlagType;

  @Column('enum', {
    enum: MemorialFlagStatus,
    nullable: false,
    name: 'status',
    enumName: 'memorial_flag_status',
    default: MemorialFlagStatus.OPEN,
  })
  status: MemorialFlagStatus;

  @Column('enum', {
    enum: MemorialFlagReason,
    nullable: true,
    name: 'reason',
    enumName: 'memorial_flag_reason',
    default: null,
    transformer: nullToUndefinedTransformer,
  })
  reason?: MemorialFlagReason;
}
