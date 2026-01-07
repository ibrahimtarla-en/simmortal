package com.simmortal.memorial;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

@Repository
public class MemorialRepository {
  private final Map<String, Map<String, Object>> memorials = new ConcurrentHashMap<>();

  public Object createMemorial(String userId, Map<String, Object> request, MultipartFile image) {
    String id = UUID.randomUUID().toString();
    Map<String, Object> memorial = new ConcurrentHashMap<>();
    memorial.put("id", id);
    memorial.put("userId", userId);
    memorial.put("name", request.getOrDefault("name", "Unnamed Memorial"));
    memorial.put("slug", request.getOrDefault("slug", "memorial-" + id.substring(0, 6)));
    memorial.put("status", "draft");
    memorial.put("createdAt", Instant.now().toString());
    memorials.put(id, memorial);
    return memorial;
  }

  public Object getMemorialById(String memorialId) {
    return memorials.get(memorialId);
  }

  public Object deleteMemorial(String memorialId, String userId) {
    Map<String, Object> memorial = memorials.remove(memorialId);
    if (memorial == null) {
      return null;
    }
    memorial.put("deletedBy", userId);
    memorial.put("deletedAt", Instant.now().toString());
    return memorial;
  }
}
