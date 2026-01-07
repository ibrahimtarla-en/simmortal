import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { VerificationModule } from 'src/verification/verification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/UserEntity';
import { ShopModule } from 'src/shop/shop.module';
import { StorageModule } from 'src/storage/storage.module';
import { MemorialModule } from 'src/memorial/memorial.module';
import { MemorialTransactionEntity } from 'src/entities/MemorialTransactionEntity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, MemorialTransactionEntity]),
    VerificationModule,
    ShopModule,
    StorageModule,
    forwardRef(() => MemorialModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
