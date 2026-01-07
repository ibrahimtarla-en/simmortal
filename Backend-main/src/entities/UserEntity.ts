import { UserAccountStatus } from 'src/user/interface/user.interface';
import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @Column({ name: 'display_name', type: 'text', default: null, nullable: true })
  displayName: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enumName: 'user_account_status',
    enum: UserAccountStatus,
    default: UserAccountStatus.ACTIVE,
  })
  status: UserAccountStatus;
}
