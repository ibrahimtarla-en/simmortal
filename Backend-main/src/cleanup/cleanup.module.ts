import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemorialEntity } from 'src/entities/MemorialEntity';
import { StorageModule } from 'src/storage/storage.module';
import { MemoryEntity } from 'src/entities/MemoryEntity';
import { CondolenceEntity } from 'src/entities/CondolenceEntity';
import { CleanupScheduler } from './cleanup.scheduler';

@Module({
  providers: [CleanupService, CleanupScheduler],
  imports: [
    TypeOrmModule.forFeature([MemorialEntity, MemoryEntity, CondolenceEntity]),
    StorageModule,
  ],
})
export class CleanupModule {}
