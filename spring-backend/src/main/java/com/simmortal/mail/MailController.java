package com.simmortal.mail;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mail")
public class MailController {
  private final MailService mailService;

  public MailController(MailService mailService) {
    this.mailService = mailService;
  }

  @PostMapping("/verification")
  public ResponseEntity<Map<String, String>> sendVerification(@Valid @RequestBody MailRequest request) {
    mailService.sendVerification(request.to(), request.subject(), request.html());
    return ResponseEntity.ok(Map.of("status", "verification email sent"));
  }

  @PostMapping("/password-reset")
  public ResponseEntity<Map<String, String>> sendPasswordReset(@Valid @RequestBody MailRequest request) {
    mailService.sendPasswordReset(request.to(), request.subject(), request.html());
    return ResponseEntity.ok(Map.of("status", "password reset email sent"));
  }

  @PostMapping("/welcome")
  public ResponseEntity<Map<String, String>> sendWelcome(@Valid @RequestBody MailRequest request) {
    mailService.sendWelcomeEmail(request.to(), request.subject(), request.html());
    return ResponseEntity.ok(Map.of("status", "welcome email sent"));
  }
}

record MailRequest(@Email @NotBlank String to, @NotBlank String subject, @NotBlank String html) {}
