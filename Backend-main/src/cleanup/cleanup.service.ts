import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, LessThan, Not, Repository } from 'typeorm';
import { CleanupTaskCode } from './cleanup.config';
import { MemorialEntity } from 'src/entities/MemorialEntity';
import {
  MemorialContributionStatus,
  MemorialStatus,
} from 'src/memorial/interface/memorial.interface';
import { StorageService } from 'src/storage/storage.service';
import { MemoryEntity } from 'src/entities/MemoryEntity';
import { CondolenceEntity } from 'src/entities/CondolenceEntity';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly storageService: StorageService,

    @InjectDataSource()
    private dataSource: DataSource,

    @InjectRepository(MemorialEntity)
    private memorialRepository: Repository<MemorialEntity>,
    @InjectRepository(MemoryEntity)
    private memoryRepository: Repository<MemoryEntity>,
    @InjectRepository(CondolenceEntity)
    private condolenceRepository: Repository<CondolenceEntity>,
  ) {}

  private async acquireAdvisoryLock(lockId: CleanupTaskCode): Promise<boolean> {
    const result = await this.dataSource.query<[{ locked: boolean }]>(
      'SELECT pg_try_advisory_lock($1) as locked',
      [lockId],
    );
    return result[0].locked;
  }

  private async releaseAdvisoryLock(lockId: CleanupTaskCode): Promise<void> {
    await this.dataSource.query('SELECT pg_advisory_unlock($1)', [lockId]);
  }

  async cleanupReservedUrls() {
    const lockAcquired = await this.acquireAdvisoryLock(CleanupTaskCode.CLEAN_RESERVED_URLS);

    if (!lockAcquired) {
      this.logger.debug('URL cleanup already running on another instance');
      return;
    }

    try {
      this.logger.log('Starting URL reservation cleanup');

      const result = await this.memorialRepository.update(
        {
          status: Not(MemorialStatus.PUBLISHED),
          premiumSlug: Not(IsNull()),
          updatedAt: LessThan(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 24 hours ago
        },
        {
          premiumSlug: null,
        },
      );

      this.logger.log(
        `Released ${result.affected} expired premium slugs from unpublished memorials`,
      );
    } catch (error) {
      this.logger.error('Error during URL cleanup', error);
    } finally {
      await this.releaseAdvisoryLock(CleanupTaskCode.CLEAN_RESERVED_URLS);
    }
  }

  async cleanupMemories() {
    const lockAcquired = await this.acquireAdvisoryLock(CleanupTaskCode.CLEAN_MEMORIES);

    if (!lockAcquired) {
      this.logger.debug('Memory cleanup already running on another instance');
      return;
    }

    try {
      this.logger.log('Starting memory cleanup');
      const cutoffDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
      const memoriesToDelete = await this.memoryRepository.find({
        where: {
          status: Not(MemorialContributionStatus.PUBLISHED),
          updatedAt: LessThan(cutoffDate),
        },
      });
      let assetDeletions = 0;
      for (const memory of memoriesToDelete) {
        if (memory.assetPath) {
          await this.storageService.delete(memory.assetPath);
          assetDeletions++;
        }
        await this.memoryRepository.remove(memory);
      }
      this.logger.log(
        `Deleted ${memoriesToDelete.length} old unpublished memories and removed ${assetDeletions} associated assets`,
      );
    } catch (error) {
      this.logger.error('Error during memory cleanup', error);
    } finally {
      await this.releaseAdvisoryLock(CleanupTaskCode.CLEAN_MEMORIES);
    }
  }

  async cleanupCondolences() {
    const lockAcquired = await this.acquireAdvisoryLock(CleanupTaskCode.CLEAN_CONDOLENCES);
    if (!lockAcquired) {
      this.logger.debug('Condolence cleanup already running on another instance');
      return;
    }

    try {
      this.logger.log('Starting condolence cleanup');
      const cutoffDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 days ago

      const result = await this.condolenceRepository.delete({
        status: Not(MemorialContributionStatus.PUBLISHED),
        updatedAt: LessThan(cutoffDate),
      });

      this.logger.log(`Deleted ${result.affected} old unpublished condolences`);
    } catch (error) {
      this.logger.error('Error during condolence cleanup', error);
    } finally {
      await this.releaseAdvisoryLock(CleanupTaskCode.CLEAN_CONDOLENCES);
    }
  }
}
