import { nullToUndefinedTransformer } from 'src/util/transformer';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './UserEntity';
import { MemorialEntity } from './MemorialEntity';
import { OrderStatus } from 'src/shop/interface/shop.interface';

@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({
    type: 'uuid',
    name: 'memorial_id',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  memorialId?: string | null;

  @ManyToOne(() => MemorialEntity)
  @JoinColumn({ name: 'memorial_id' })
  memorial?: MemorialEntity;

  @Column({ type: 'text', name: 'first_name', nullable: false })
  firstName: string;

  @Column({ type: 'text', name: 'last_name', nullable: false })
  lastName: string;

  @Column({ type: 'text', nullable: false })
  country: string;

  @Column({ type: 'text', nullable: false })
  city: string;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column({ type: 'text', name: 'post_code', nullable: false })
  postCode: string;

  @Column({ type: 'text', nullable: false })
  state: string;

  @Column({ type: 'text', nullable: false })
  email: string;

  @Column({ type: 'text', name: 'phone_number', nullable: false })
  phoneNumber: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: false })
  userId: string;

  @Column({ type: 'uuid', name: 'item_id', nullable: false })
  itemId: string;

  @Column({ type: 'integer', nullable: false })
  quantity: number;

  @Column({ type: 'text', nullable: true, default: null, transformer: nullToUndefinedTransformer })
  message?: string | null;

  @Column({
    type: 'text',
    name: 'session_id',
    nullable: true,
    transformer: nullToUndefinedTransformer,
    default: null,
  })
  sessionId?: string;

  @Column({
    type: 'text',
    name: 'payment_id',
    nullable: true,
    transformer: nullToUndefinedTransformer,
    default: null,
  })
  paymentId?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    enumName: 'order_status',
    nullable: false,
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
