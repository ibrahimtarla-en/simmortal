package com.simmortal.notification;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("notification")
public class NotificationController {
  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping
  public Object getNotifications(
      @RequestHeader("X-User-Id") String userId,
      @RequestParam(value = "cursor", required = false) String cursor
  ) {
    return notificationService.getPaginatedNotifications(userId, cursor);
  }

  @PatchMapping("{notificationId}/read")
  public Object markNotificationRead(
      @RequestHeader("X-User-Id") String userId,
      @PathVariable String notificationId
  ) {
    return notificationService.markNotificationRead(userId, notificationId);
  }
}
