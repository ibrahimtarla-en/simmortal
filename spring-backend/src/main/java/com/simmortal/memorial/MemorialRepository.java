package com.simmortal.memorial;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class MemorialRepository {
  private final Map<String, Map<String, Object>> memorials = new ConcurrentHashMap<>();

  public Map<String, Object> save(Map<String, Object> memorial) {
    memorials.put(memorial.get("id").toString(), memorial);
    return memorial;
  }

  public Map<String, Object> getMemorialById(String memorialId) {
    return memorials.get(memorialId);
  }

  public Optional<Map<String, Object>> findBySlug(String slug) {
    return memorials.values().stream()
        .filter(memorial -> slug.equals(memorial.get("defaultSlug")) || slug.equals(memorial.get("premiumSlug")))
        .findFirst();
  }

  public List<Map<String, Object>> getAllMemorials() {
    return new ArrayList<>(memorials.values());
  }

  public List<Map<String, Object>> getMemorialsByOwner(String userId) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> memorial : memorials.values()) {
      if (userId.equals(memorial.get("userId"))) {
        results.add(memorial);
      }
    }
    return results;
  }

  public void remove(String memorialId) {
    memorials.remove(memorialId);
  }
}
