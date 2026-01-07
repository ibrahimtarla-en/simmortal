package com.simmortal.verification;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/verification")
public class VerificationController {
  private final VerificationService verificationService;

  public VerificationController(VerificationService verificationService) {
    this.verificationService = verificationService;
  }

  @PostMapping("/sms/send")
  public ResponseEntity<Map<String, String>> sendSms(@Valid @RequestBody SendSmsRequest request) {
    verificationService.sendSmsVerificationOtp(request.phoneNumber());
    return ResponseEntity.ok(Map.of("status", "sms sent"));
  }

  @PostMapping("/sms/validate")
  public ResponseEntity<Map<String, Object>> validateSms(@Valid @RequestBody ValidateSmsRequest request) {
    boolean approved = verificationService.validateSmsVerificationOtp(request.phoneNumber(), request.code());
    return ResponseEntity.ok(Map.of("approved", approved));
  }
}

record SendSmsRequest(@NotBlank String phoneNumber) {}

record ValidateSmsRequest(@NotBlank String phoneNumber, @NotBlank String code) {}
