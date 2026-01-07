import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { MemorialEntity } from './MemorialEntity';

@Entity('featured_memorial')
export class FeaturedMemorialEntity {
  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => MemorialEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  memorial: MemorialEntity;
}
