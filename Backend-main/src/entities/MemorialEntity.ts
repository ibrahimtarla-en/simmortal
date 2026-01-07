import {
  MEMORIAL_FRAMES,
  MemorialTribute,
  MemorialFrame,
  RelationToDeceased,
  MemorialStatus,
  MEMORIAL_MUSIC,
  MemorialMusic,
  MemorialContributionStatus,
  MemorialLivePortraitEffect,
} from 'src/memorial/interface/memorial.interface';
import { nullToUndefinedTransformer, transformInt } from 'src/util/transformer';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  VirtualColumn,
  JoinColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { MemorialLikeEntity } from './MemorialLikeEntity';
import { MemoryEntity } from './MemoryEntity';
import { MemorialTimelineEntity } from './MemorialTimelineEntity';
import { UserEntity } from './UserEntity';
import { CondolenceEntity } from './CondolenceEntity';
import { getCandlesCountQuery, getFlowersCountQuery } from 'src/memorial/memorial.config';
import { MemorialLocationEntity } from './MemorialLocationEntity';
import { DonationEntity } from './DonationEntity';
import { MemorialTransactionEntity } from './MemorialTransactionEntity';

@Entity('memorial')
export class MemorialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @OneToMany(() => MemorialLikeEntity, (like) => like.memorial)
  likes: MemorialLikeEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  @Column({
    type: 'text',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  name?: string;

  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  dateOfBirth?: string;

  @Column({
    name: 'date_of_death',
    type: 'date',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  dateOfDeath?: string;

  @Column({
    name: 'place_of_birth',
    type: 'date',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  placeOfBirth?: string;

  @Column({
    name: 'place_of_death',
    type: 'date',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  placeOfDeath?: string;

  @Column({
    name: 'owner_relation',
    type: 'text',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  ownerRelation?: RelationToDeceased;

  @Column({
    name: 'origin_country',
    type: 'text',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  originCountry?: string;

  @Column({
    name: 'image_path',
    type: 'text',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  imagePath?: string;

  @Column({
    name: 'live_portrait_path',
    type: 'text',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  livePortraitPath?: string | null;

  @Column({
    name: 'cover_image_path',
    type: 'text',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  coverImagePath?: string;

  @Column({ type: 'text', nullable: true, transformer: nullToUndefinedTransformer })
  about?: string;

  @Column({
    type: 'enum',
    enum: MemorialStatus,
    enumName: 'memorial_status',
    default: MemorialStatus.DRAFT,
  })
  status: MemorialStatus;

  @Column({ type: 'boolean', default: false })
  unlisted: boolean;

  @Column({
    name: 'default_slug',
    type: 'text',
    nullable: false,
    unique: true,
  })
  defaultSlug: string;

  @Column({
    name: 'premium_slug',
    type: 'text',
    nullable: true,
    unique: true,
  })
  premiumSlug: string | null;

  @Column({
    name: 'is_premium',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isPremium: boolean;

  @Column({
    name: 'frame_v2',
    type: 'enum',
    enum: MEMORIAL_FRAMES,
    enumName: 'memorial_frame_v2',
    default: 'default',
  })
  frame: MemorialFrame;

  @Column({
    name: 'music',
    type: 'enum',
    enum: MEMORIAL_MUSIC,
    enumName: 'memorial_music',
    default: null,
    nullable: true,
  })
  music: MemorialMusic | null;

  @Column({
    name: 'tribute_v2',
    type: 'enum',
    enum: MemorialTribute,
    enumName: 'memorial_tribute_v2',
    default: 'default',
  })
  tribute: MemorialTribute;

  @Column({
    name: 'live_portrait_effect',
    type: 'enum',
    enum: MemorialLivePortraitEffect,
    enumName: 'memorial_live_portrait',
    default: null,
    nullable: true,
  })
  livePortraitEffect: MemorialLivePortraitEffect | null;

  @Column({
    type: 'int8',
    nullable: true,
    transformer: transformInt,
    default: null,
    name: 'simmtag_design',
  })
  simmTagDesign: number | null;

  @OneToMany(() => MemoryEntity, (memory) => memory.memorial)
  @JoinColumn({ name: 'id' })
  memories: MemoryEntity[];

  @OneToMany(() => CondolenceEntity, (condolence) => condolence.memorial)
  @JoinColumn({ name: 'id' })
  condolences: CondolenceEntity[];

  @OneToMany(() => DonationEntity, (donation) => donation.memorial)
  @JoinColumn({ name: 'id' })
  donations: DonationEntity[];

  @OneToMany(() => MemorialTransactionEntity, (transaction) => transaction.memorial)
  @JoinColumn({ name: 'id' })
  transactions: MemorialTransactionEntity[];

  @OneToOne(() => MemorialTimelineEntity, (timeline) => timeline.memorial)
  @JoinColumn({ name: 'id' })
  timeline?: MemorialTimelineEntity;

  @OneToOne(() => MemorialLocationEntity, (location) => location.memorial)
  @JoinColumn({ name: 'id' })
  location?: MemorialLocationEntity;

  @VirtualColumn({
    type: 'int',
    transformer: transformInt,
    query: (alias) => `(SELECT COUNT(*) FROM memorial_like ml WHERE ml.memorial_id = ${alias}.id)`,
  })
  totalLikes: number;

  @VirtualColumn({
    type: 'int',
    transformer: transformInt,
    query: (alias) =>
      `(SELECT COUNT(*) FROM memory m WHERE m.memorial_id = ${alias}.id AND m.status = 'published')`,
  })
  totalMemories: number;

  @VirtualColumn({
    type: 'int',
    transformer: transformInt,
    query: (alias) =>
      `(SELECT COUNT(*) FROM condolence c WHERE c.memorial_id = ${alias}.id AND c.status = 'published')`,
  })
  totalCondolences: number;

  @VirtualColumn({
    type: 'int',
    transformer: transformInt,
    query: (alias) =>
      `(SELECT COUNT(*) FROM memorial_view_log c WHERE c.memorial_id = ${alias}.id)`,
  })
  totalViews: number;
  @VirtualColumn({
    type: 'int',
    transformer: transformInt,
    query: (alias) => getFlowersCountQuery(alias),
  })
  totalFlowers: number;

  @VirtualColumn({
    type: 'int',
    transformer: transformInt,
    query: (alias) => getCandlesCountQuery(alias),
  })
  totalCandles: number;

  @VirtualColumn({
    type: 'int',
    transformer: transformInt,
    query: (alias) =>
      `(SELECT COALESCE(SUM(d.item_count), 0) FROM donation d WHERE d.memorial_id = ${alias}.id AND  d.status = '${MemorialContributionStatus.PUBLISHED}')`,
  })
  totalTrees: number;

  @VirtualColumn({
    type: 'int',
    transformer: transformInt,
    query: (alias) =>
      `(SELECT COALESCE(SUM(d.value_in_cents), 0) FROM donation d WHERE d.memorial_id = ${alias}.id AND  d.status = '${MemorialContributionStatus.PUBLISHED}')`,
  })
  totalDonationsInCents: number;
}
