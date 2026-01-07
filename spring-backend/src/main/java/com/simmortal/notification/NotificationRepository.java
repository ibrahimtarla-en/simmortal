package com.simmortal.notification;

import org.springframework.stereotype.Repository;

@Repository
public class NotificationRepository {
  public Object getNotifications(String userId, String cursor) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object markNotificationRead(String userId, String notificationId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }
}
