import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { ShopItemEntity } from './ShopItemEntity';

@Entity('shop_featured')
export class ShopFeaturedEntity {
  @PrimaryColumn({ type: 'uuid', name: 'item_id' })
  itemId: string;

  @OneToOne(() => ShopItemEntity, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: ShopItemEntity;

  @Column({ type: 'text', name: 'image_path', nullable: false })
  imagePath: string;

  @Column({ type: 'text', name: 'title_en', nullable: false })
  titleEn: string;

  @Column({ type: 'text', name: 'title_tr', nullable: false })
  titleTr: string;

  @Column({ type: 'text', name: 'description_en', nullable: false })
  descriptionEn: string;

  @Column({ type: 'text', name: 'description_tr', nullable: false })
  descriptionTr: string;
}
