package com.simmortal.verification;

import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class VerificationService {
  private static final Logger logger = LoggerFactory.getLogger(VerificationService.class);
  private final String accountSid;
  private final String authToken;
  private final String serviceSid;

  public VerificationService() {
    this.accountSid = System.getenv("TWILIO_ACCOUNT_SID");
    this.authToken = System.getenv("TWILIO_AUTH_TOKEN");
    this.serviceSid = System.getenv("TWILIO_SERVICE_SID");
    if (accountSid != null && authToken != null) {
      Twilio.init(accountSid, authToken);
    }
  }

  public void sendSmsVerificationOtp(String phoneNumber) {
    ensureConfigured();
    Verification.creator(serviceSid, phoneNumber, "sms").create();
    logger.info("Sent verification SMS to {}", phoneNumber);
  }

  public boolean validateSmsVerificationOtp(String phoneNumber, String code) {
    ensureConfigured();
    VerificationCheck check = VerificationCheck.creator(serviceSid, code).setTo(phoneNumber).create();
    return "approved".equalsIgnoreCase(check.getStatus());
  }

  private void ensureConfigured() {
    if (accountSid == null || authToken == null || serviceSid == null) {
      throw new IllegalStateException("Twilio environment variables are not configured.");
    }
  }
}
