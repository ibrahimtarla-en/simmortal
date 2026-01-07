import { forwardRef, Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { MemorialModule } from 'src/memorial/memorial.module';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/OrderEntity';
import { DecorationPriceEntity } from 'src/entities/DecorationPriceEntity';
import { TributePriceEntity } from 'src/entities/TributePriceEntity';
import { WreathPriceEntity } from 'src/entities/WreathPriceEntity';
import { ShopItemEntity } from 'src/entities/ShopItemEntity';
import { ShopFeaturedEntity } from 'src/entities/ShopFeaturedEntity';
import { ShopWaitlistEntity } from 'src/entities/ShopWaitlistEntity';
import { MemorialTransactionEntity } from 'src/entities/MemorialTransactionEntity';

@Module({
  providers: [ShopService],
  controllers: [ShopController],
  exports: [ShopService],
  imports: [
    forwardRef(() => MemorialModule),
    TypeOrmModule.forFeature([
      OrderEntity,
      DecorationPriceEntity,
      TributePriceEntity,
      WreathPriceEntity,
      ShopItemEntity,
      ShopFeaturedEntity,
      ShopWaitlistEntity,
      MemorialTransactionEntity,
    ]),
    CacheModule.register({
      ttl: 60000,
    }),
  ],
})
export class ShopModule {}
