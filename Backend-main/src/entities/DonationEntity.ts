import {
  MemorialContributionStatus,
  MemorialDonationWreath,
} from 'src/memorial/interface/memorial.interface';
import { transformInt } from 'src/util/transformer';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  VirtualColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from './UserEntity';
import { MemorialEntity } from './MemorialEntity';
import { DonationLikeEntity } from './DonationLikeEntity';

@Entity('donation')
export class DonationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'memorial_id' })
  memorialId: string;

  @ManyToOne(() => MemorialEntity)
  @JoinColumn({ name: 'memorial_id' })
  memorial: MemorialEntity;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @OneToMany(() => DonationLikeEntity, (like) => like.donation)
  likes: DonationLikeEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'int8', name: 'item_count', transformer: transformInt })
  itemCount: number;

  @Column({ type: 'int8', name: 'value_in_cents', transformer: transformInt })
  valueInCents: number;

  @Column({
    type: 'enum',
    name: 'wreath',
    enum: MemorialDonationWreath,
    enumName: 'memorial_wreath',
  })
  wreath: MemorialDonationWreath;

  @Column({
    type: 'enum',
    name: 'status',
    default: MemorialContributionStatus.DRAFT,
    enumName: 'memorial_contribution_status',
    enum: MemorialContributionStatus,
  })
  status: MemorialContributionStatus;

  @Column({
    type: 'text',
    name: 'checkout_session_id',
    nullable: true,
    default: null,
  })
  checkoutSessionId: string | null;

  @VirtualColumn({
    type: 'int',
    transformer: transformInt,
    query: (alias) => `(SELECT COUNT(*) FROM donation_like dl WHERE dl.donation_id = ${alias}.id)`,
  })
  totalLikes: number;
}
