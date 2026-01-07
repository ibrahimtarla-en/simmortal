import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [AssetController],
})
export class AssetModule {}
