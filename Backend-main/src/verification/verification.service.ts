import { Injectable } from '@nestjs/common';
import { env } from 'src/config/env';
import * as createTwilioClient from 'twilio';

@Injectable()
export class VerificationService {
  private twilioClient = createTwilioClient(env.twilio.accountSid, env.twilio.authToken);

  constructor() {}

  async sendSmsVerificationOtp(phoneNumber: string): Promise<void> {
    await this.twilioClient.verify.v2
      .services(env.twilio.serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
  }

  async validateSmsVerificationOtp(phoneNumber: string, code: string): Promise<boolean> {
    const verificationCheck = await this.twilioClient.verify.v2
      .services(env.twilio.serviceSid)
      .verificationChecks.create({ to: phoneNumber, code });

    return verificationCheck.status === 'approved';
  }
}
