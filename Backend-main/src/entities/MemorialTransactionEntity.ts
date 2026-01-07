import { Entity, Column, CreateDateColumn, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MemorialEntity } from './MemorialEntity';
import { UserEntity } from './UserEntity';
import { transformInt } from 'src/util/transformer';

@Entity('memorial_transaction')
export class MemorialTransactionEntity {
  @PrimaryColumn({ type: 'text', name: 'payment_id' })
  paymentId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'uuid', name: 'memorial_id', nullable: false })
  memorialId: string;

  @ManyToOne(() => MemorialEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'memorial_id' })
  memorial: MemorialEntity;

  @Column({ type: 'uuid', name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'int8', name: 'value_in_cents', nullable: false, transformer: transformInt })
  valueInCents: number;

  @Column({ type: 'text', nullable: false })
  type: string;
}
