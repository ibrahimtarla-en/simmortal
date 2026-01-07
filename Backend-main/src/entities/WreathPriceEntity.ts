import { MemorialDonationWreath } from 'src/memorial/interface/memorial.interface';
import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('wreath_price')
export class WreathPriceEntity {
  @PrimaryColumn({
    type: 'enum',
    enum: MemorialDonationWreath,
    enumName: 'memorial_wreath',
  })
  wreath: MemorialDonationWreath;

  @Column({ type: 'int', name: 'price_in_cents', nullable: false })
  priceInCents: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
