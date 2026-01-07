import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { UserEntity } from './UserEntity';
import { NotificationType } from 'src/notification/interface/notification.interface';

@Entity('notification')
export class NotificationEntity {
  @PrimaryColumn({ type: 'uuid', name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'uuid', name: 'actor_id' })
  actorId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor: UserEntity;

  @Column({ type: 'uuid', name: 'reference_id' })
  referenceId: string;

  @Column({ type: 'enum', enum: NotificationType, name: 'type' })
  type: NotificationType;

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp with time zone', name: 'read_at', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
    precision: 3,
  })
  createdAt: Date;

  @Column({ type: 'text', name: 'redirect_url', nullable: true, default: null })
  redirectUrl: string | null;

  @Column({ type: 'jsonb', name: 'payload', nullable: false, default: {} })
  payload: Record<string, any>;
}
