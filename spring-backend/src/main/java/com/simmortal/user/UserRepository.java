package com.simmortal.user;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
  private final Map<String, Map<String, Object>> users = new ConcurrentHashMap<>();

  public Object getUserById(String userId) {
    return users.get(userId);
  }

  public Object getAllUsers() {
    return new ArrayList<>(users.values());
  }

  public Object getAdminUserDetails(String userId) {
    return users.get(userId);
  }

  public Object updateUserStatus(String userId, UserAccountStatus status, String adminUserId) {
    Map<String, Object> user = users.computeIfAbsent(userId, this::createDefaultUser);
    user.put("status", status.getValue());
    user.put("updatedBy", adminUserId);
    user.put("updatedAt", Instant.now().toString());
    return user;
  }

  public Object deleteUser(String userId) {
    Map<String, Object> user = users.get(userId);
    if (user == null) {
      return null;
    }
    user.put("status", UserAccountStatus.DELETED.getValue());
    user.put("deletedAt", Instant.now().toString());
    return user;
  }

  private Map<String, Object> createDefaultUser(String userId) {
    String email = "user-" + userId + "@example.com";
    return new ConcurrentHashMap<>(Map.of(
        "id", userId,
        "email", email,
        "status", UserAccountStatus.ACTIVE.getValue(),
        "createdAt", Instant.now().toString(),
        "customerId", "cus_" + UUID.randomUUID()
    ));
  }
}
