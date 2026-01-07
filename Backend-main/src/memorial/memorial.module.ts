import { forwardRef, Module } from '@nestjs/common';
import { MemorialService } from './memorial.service';
import { MemorialController } from './memorial.controller';
import { StorageModule } from 'src/storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemorialEntity } from 'src/entities/MemorialEntity';
import { AIModule } from 'src/ai/ai.module';
import { MemorialViewLogEntity } from 'src/entities/MemorialViewLogEntity';
import { ShopModule } from 'src/shop/shop.module';
import { MemoryService } from './memory/memory.service';
import { MemoryEntity } from 'src/entities/MemoryEntity';
import { MemoryController } from './memory/memory.controller';
import { MemorialLikeEntity } from 'src/entities/MemorialLikeEntity';
import { FeaturedMemorialEntity } from 'src/entities/FeaturedMemorialEntity';
import { CacheModule } from '@nestjs/cache-manager';
import { MemoryLikeEntity } from 'src/entities/MemoryLikeEntity';
import { CondolenceEntity } from 'src/entities/CondolenceEntity';
import { CondolenceLikeEntity } from 'src/entities/CondolenceLikeEntity';
import { CondolenceService } from './condolence/condolence.service';
import { CondolenceController } from './condolence/condolence.controller';
import { NotificationModule } from 'src/notification/notification.module';
import { MemorialTimelineEntity } from 'src/entities/MemorialTimelineEntity';
import { MemorialFlagEntity } from 'src/entities/MemorialFlagEntity';
import { MemorialSubscriptionEntity } from 'src/entities/MemorialSubscriptionEntity';
import { UserModule } from 'src/user/user.module';
import { SimmTagService } from './simmtag/simmtag.service';
import { MemorialLocationEntity } from 'src/entities/MemorialLocationEntity';
import { SimmTagController } from './simmtag/simmtag.controller';
import { DonationEntity } from 'src/entities/DonationEntity';
import { DonationLikeEntity } from 'src/entities/DonationLikeEntity';
import { DonationService } from './donation/donation.service';
import { DonationController } from './donation/donation.controller';

@Module({
  providers: [MemorialService, MemoryService, CondolenceService, SimmTagService, DonationService],
  controllers: [
    MemorialController,
    MemoryController,
    CondolenceController,
    SimmTagController,
    DonationController,
  ],
  imports: [
    TypeOrmModule.forFeature([
      MemorialEntity,
      MemorialViewLogEntity,
      MemoryEntity,
      MemorialLikeEntity,
      MemorialTimelineEntity,
      FeaturedMemorialEntity,
      MemoryLikeEntity,
      CondolenceEntity,
      CondolenceLikeEntity,
      MemorialFlagEntity,
      MemorialSubscriptionEntity,
      MemorialLocationEntity,
      DonationEntity,
      DonationLikeEntity,
    ]),
    StorageModule,
    AIModule,
    CacheModule.register({
      ttl: 30000,
    }),
    forwardRef(() => ShopModule),
    NotificationModule,
    forwardRef(() => UserModule),
  ],
  exports: [MemorialService, MemoryService, CondolenceService, SimmTagService, DonationService],
})
export class MemorialModule {}
