import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { env } from './config/env';
import { UserModule } from './user/user.module';
import { StorageModule } from './storage/storage.module';
import { MemorialModule } from './memorial/memorial.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationModule } from './verification/verification.module';
import { MailModule } from './mail/mail.module';
import { AssetModule } from './asset/asset.module';
import { ShopModule } from './shop/shop.module';
import { AIModule } from './ai/ai.module';
import { NotificationModule } from './notification/notification.module';
import { ContactModule } from './contact/contact.module';
import { AdminModule } from './admin/admin.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.pg.host,
      port: env.pg.port,
      username: env.pg.username,
      password: env.pg.password,
      database: env.pg.database,
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(),
    MailModule,
    UserModule,
    StorageModule,
    MemorialModule,
    VerificationModule,
    AssetModule,
    ShopModule,
    AIModule,
    NotificationModule,
    ContactModule,
    AdminModule,
    CleanupModule,
  ],
})
export class AppModule {}
