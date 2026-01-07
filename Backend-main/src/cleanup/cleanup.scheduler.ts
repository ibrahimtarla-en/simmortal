import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';

const cronOrDefault = (key: string, fallback: string) => process.env[key] ?? fallback;

@Injectable()
export class CleanupScheduler {
  private readonly logger = new Logger(CleanupScheduler.name);

  constructor(private readonly cleanupService: CleanupService) {}

  @Cron(cronOrDefault('CLEANUP_CRON_RESERVED_URLS', '0 0 * * * *'), {
    name: 'cleanup-reserved-urls',
  })
  async handleReservedUrlsCleanup() {
    this.logger.debug('Triggering reserved URL cleanup');
    await this.cleanupService.cleanupReservedUrls();
  }

  @Cron(cronOrDefault('CLEANUP_CRON_MEMORIES', '0 0 2 * * *'), {
    name: 'cleanup-memories',
  })
  async handleMemoriesCleanup() {
    this.logger.debug('Triggering memory cleanup');
    await this.cleanupService.cleanupMemories();
  }

  @Cron(cronOrDefault('CLEANUP_CRON_CONDOLENCES', '0 0 3 * * *'), {
    name: 'cleanup-condolences',
  })
  async handleCondolenceCleanup() {
    this.logger.debug('Triggering condolence cleanup');
    await this.cleanupService.cleanupCondolences();
  }
}
