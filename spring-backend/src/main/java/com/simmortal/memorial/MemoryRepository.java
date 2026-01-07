package com.simmortal.memorial;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class MemoryRepository {
  private final Map<String, Map<String, Object>> memories = new ConcurrentHashMap<>();

  public Object getMemoryById(String id) {
    return memories.getOrDefault(id, Map.of(
        "id", id,
        "status", "draft",
        "createdAt", Instant.now().toString()
    ));
  }
}
