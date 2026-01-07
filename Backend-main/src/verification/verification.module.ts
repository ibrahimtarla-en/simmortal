import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';

@Module({
  imports: [],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
