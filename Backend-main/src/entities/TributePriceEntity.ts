import { MemorialTribute } from 'src/memorial/interface/memorial.interface';
import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('tribute_price')
export class TributePriceEntity {
  @PrimaryColumn({
    type: 'enum',
    enum: MemorialTribute,
    enumName: 'memorial_tribute_v2',
  })
  tribute: MemorialTribute;

  @Column({ type: 'int', name: 'price_in_cents', nullable: true })
  priceInCents: number | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
