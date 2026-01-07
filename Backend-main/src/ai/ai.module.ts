import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { StorageModule } from 'src/storage/storage.module';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiGreetingEntity } from 'src/entities/AiGreetingEntity';

@Module({
  imports: [StorageModule, HttpModule, TypeOrmModule.forFeature([AiGreetingEntity])],
  exports: [AIService],
  providers: [AIService],
})
export class AIModule {}
