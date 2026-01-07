import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { MemorialEntity } from './MemorialEntity';

@Entity('memorial_subscription')
export class MemorialSubscriptionEntity {
  @PrimaryColumn('uuid', { name: 'memorial_id' })
  memorialId: string;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_updated',
  })
  lastUpdated: Date;

  @Column({ type: 'text', name: 'subscription_id', nullable: false })
  subscriptionId: string;

  @ManyToOne(() => MemorialEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'memorial_id' })
  memorial: MemorialEntity;
}
