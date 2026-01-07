package com.simmortal.notification;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {
  private final NotificationRepository notificationRepository;

  public NotificationService(NotificationRepository notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  public Object getPaginatedNotifications(String userId, String cursor) {
    return notificationRepository.getNotifications(userId, cursor);
  }

  public Object markNotificationRead(String userId, String notificationId) {
    return notificationRepository.markNotificationRead(userId, notificationId);
  }
}
