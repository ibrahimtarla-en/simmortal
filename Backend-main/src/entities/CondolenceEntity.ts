import {
  MemorialContributionStatus,
  MemorialDecoration,
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
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './UserEntity';
import { MemorialEntity } from './MemorialEntity';
import { CondolenceLikeEntity } from './CondolenceLikeEntity';

@Entity('condolence')
export class CondolenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @Column({ type: 'uuid', name: 'memorial_id' })
  memorialId: string;

  @OneToMany(() => CondolenceLikeEntity, (like) => like.condolence)
  likes: CondolenceLikeEntity[];

  @ManyToOne(() => MemorialEntity)
  @JoinColumn({ name: 'memorial_id' })
  memorial: MemorialEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  @Column({
    type: 'text',
    nullable: false,
  })
  content: string;

  @Column({
    name: 'decoration_new',
    type: 'enum',
    enum: MemorialDecoration,
    enumName: 'memorial_decoration_new',
    nullable: true,
  })
  decoration: MemorialDecoration | null;

  @Column({
    type: 'enum',
    name: 'status',
    default: MemorialContributionStatus.DRAFT,
    enumName: 'memorial_contribution_status',
    enum: MemorialContributionStatus,
  })
  status: MemorialContributionStatus;

  @Column({ type: 'int8', name: 'donation_count', default: 0, transformer: transformInt })
  donationCount: number;

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
    query: (alias) =>
      `(SELECT COUNT(*) FROM condolence_like cl WHERE cl.condolence_id = ${alias}.id)`,
  })
  totalLikes: number;
}
