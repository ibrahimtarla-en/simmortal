import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactFormEntity } from 'src/entities/ContactFormEntity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactFormEntity])],
  providers: [ContactService],
  controllers: [ContactController],
  exports: [ContactService],
})
export class ContactModule {}
