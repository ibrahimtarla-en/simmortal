import { transformInt } from 'src/util/transformer';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ShopFeaturedEntity } from './ShopFeaturedEntity';
import { ShopWaitlistEntity } from './ShopWaitlistEntity';

@Entity('shop_item')
export class ShopItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'text', name: 'name_en', nullable: false })
  nameEn: string;

  @Column({ type: 'text', name: 'name_tr', nullable: false })
  nameTr: string;

  @Column({ type: 'text', name: 'description_en', nullable: false })
  descriptionEn: string;

  @Column({ type: 'text', name: 'description_tr', nullable: false })
  descriptionTr: string;

  @Column({ type: 'int8', name: 'price_in_cents', transformer: transformInt })
  priceInCents: number;

  @Column({ type: 'text', name: 'image_path', array: true, nullable: false })
  imagePath: string[];

  @Column({ type: 'text', nullable: false, unique: true })
  slug: string;

  @Column({ type: 'text', name: 'category_en', array: true, nullable: false })
  categoryEn: string[];

  @Column({ type: 'boolean', name: 'is_active', nullable: false, default: false })
  isActive: boolean;

  @Column({ type: 'text', name: 'category_tr', array: true, nullable: false })
  categoryTr: string[];

  @OneToOne(() => ShopFeaturedEntity, (featured) => featured.item)
  featured?: ShopFeaturedEntity;

  @OneToMany(() => ShopWaitlistEntity, (waitlist) => waitlist.item)
  waitlist?: ShopWaitlistEntity[];
}
