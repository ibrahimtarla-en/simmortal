import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemorialEntity } from 'src/entities/MemorialEntity';
import { StorageModule } from 'src/storage/storage.module';
import { MemoryEntity } from 'src/entities/MemoryEntity';
import { CondolenceEntity } from 'src/entities/CondolenceEntity';

@Module({
  providers: [CleanupService],
  imports: [
    TypeOrmModule.forFeature([MemorialEntity, MemoryEntity, CondolenceEntity]),
    StorageModule,
  ],
})
export class CleanupModule {}
