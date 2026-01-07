package com.simmortal.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class MailService {
  private static final Logger logger = LoggerFactory.getLogger(MailService.class);
  private final JavaMailSenderImpl mailSender;

  public MailService() {
    this.mailSender = new JavaMailSenderImpl();
    String host = System.getenv("MAIL_HOST");
    String port = System.getenv("MAIL_PORT");
    String username = System.getenv("MAIL_USERNAME");
    String password = System.getenv("MAIL_PASSWORD");

    if (host != null) {
      mailSender.setHost(host);
    }
    if (port != null) {
      mailSender.setPort(Integer.parseInt(port));
    }
    if (username != null) {
      mailSender.setUsername(username);
    }
    if (password != null) {
      mailSender.setPassword(password);
    }
  }

  public void sendVerification(String to, String subject, String html) {
    sendEmail(to, subject, html);
  }

  public void sendPasswordReset(String to, String subject, String html) {
    sendEmail(to, subject, html);
  }

  public void sendWelcomeEmail(String to, String subject, String html) {
    sendEmail(to, subject, html);
  }

  private void sendEmail(String to, String subject, String html) {
    if (mailSender.getHost() == null) {
      throw new IllegalStateException("MAIL_HOST is not configured.");
    }
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
      helper.setFrom("no-reply@simmortals.com");
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(html, true);
      mailSender.send(message);
    } catch (MessagingException ex) {
      logger.error("Failed to send mail to {}", to, ex);
      throw new IllegalStateException("Failed to send email", ex);
    }
  }
}
