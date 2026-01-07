import { nullToUndefinedTransformer } from 'src/util/transformer';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './UserEntity'; // Adjust path as needed
import { ContactFormStatus } from 'src/contact/interface/contact.interface';

@Entity('contact_form')
export class ContactFormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  updatedAt: Date;

  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  userId?: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({
    name: 'first_name',
    type: 'text',
    nullable: false,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'text',
    nullable: false,
  })
  lastName: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  email: string;

  @Column({
    name: 'phone_number',
    type: 'text',
    nullable: false,
  })
  phoneNumber: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  message: string;

  @Column({
    type: 'enum',
    enum: ContactFormStatus,
    enumName: 'contact_form_status',
    default: ContactFormStatus.OPEN,
  })
  status: ContactFormStatus;

  @Column({
    type: 'uuid',
    name: 'closed_by',
    nullable: true,
    transformer: nullToUndefinedTransformer,
  })
  closedBy?: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'closed_by' })
  closedByUser?: UserEntity;
}
