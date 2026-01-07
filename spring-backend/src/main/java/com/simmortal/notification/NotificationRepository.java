package com.simmortal.notification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class NotificationRepository {
  private final Map<String, List<Map<String, Object>>> notifications = new ConcurrentHashMap<>();

  public Object getNotifications(String userId, String cursor) {
    return new ArrayList<>(notifications.getOrDefault(userId, List.of()));
  }

  public Object markNotificationRead(String userId, String notificationId) {
    List<Map<String, Object>> list = notifications.getOrDefault(userId, new ArrayList<>());
    for (Map<String, Object> notification : list) {
      if (notificationId.equals(notification.get("id"))) {
        notification.put("readAt", Instant.now().toString());
        return notification;
      }
    }
    return null;
  }
}
