import { MemorialDecoration } from 'src/memorial/interface/memorial.interface';
import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('decoration_price')
export class DecorationPriceEntity {
  @PrimaryColumn({
    type: 'enum',
    enum: MemorialDecoration,
    enumName: 'memorial_decoration_new',
  })
  decoration: MemorialDecoration;

  @Column({ type: 'int', name: 'price_in_cents', nullable: false })
  priceInCents: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
