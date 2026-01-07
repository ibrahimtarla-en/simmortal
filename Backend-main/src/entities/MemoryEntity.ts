import {
  MemorialContributionStatus,
  MemorialDecoration,
  MemorialTribute,
} from 'src/memorial/interface/memorial.interface';
import { nullToUndefinedTransformer, transformInt } from 'src/util/transformer';
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
import { AssetType } from 'src/types/asset';
import { MemoryLikeEntity } from './MemoryLikeEntity';

@Entity('memory')
export class MemoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @Column({ type: 'uuid', name: 'memorial_id' })
  memorialId: string;

  @ManyToOne(() => MemorialEntity)
  @JoinColumn({ name: 'memorial_id' })
  memorial: MemorialEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  @OneToMany(() => MemoryLikeEntity, (like) => like.memory)
  likes: MemoryLikeEntity[];

  @Column({
    type: 'date',
    nullable: false,
  })
  date: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  content: string;

  @Column({
    name: 'asset_path',
    type: 'text',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  assetPath?: string | null;

  @Column({
    name: 'asset_decoration_v2',
    type: 'enum',
    enum: MemorialTribute,
    enumName: 'memorial_tribute_v2',
    nullable: true,
  })
  assetDecoration: MemorialTribute | null;

  @Column({
    name: 'decoration_new',
    type: 'enum',
    enum: MemorialDecoration,
    enumName: 'memorial_decoration_new',
    nullable: true,
  })
  decoration: MemorialDecoration | null;

  @Column({
    name: 'asset_type',
    type: 'enum',
    enum: AssetType,
    enumName: 'asset_type',
    nullable: true,
    default: null,
    transformer: nullToUndefinedTransformer,
  })
  assetType?: AssetType | null;

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
    query: (alias) => `(SELECT COUNT(*) FROM memory_like ml WHERE ml.memory_id = ${alias}.id)`,
  })
  totalLikes: number;
}
