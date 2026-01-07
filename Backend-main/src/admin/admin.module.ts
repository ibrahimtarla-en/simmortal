// @ts-ignore
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserModule } from 'src/user/user.module';
import { MemorialModule } from 'src/memorial/memorial.module';
import { ContactModule } from 'src/contact/contact.module';
import { ShopModule } from 'src/shop/shop.module';

@Module({
  providers: [AdminService],
  controllers: [AdminController],
  imports: [UserModule, MemorialModule, ContactModule, ShopModule],
})
export class AdminModule {}
