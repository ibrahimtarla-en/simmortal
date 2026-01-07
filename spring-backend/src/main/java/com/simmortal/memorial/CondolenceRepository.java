package com.simmortal.memorial;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class CondolenceRepository {
  private final Map<String, Map<String, Object>> condolences = new ConcurrentHashMap<>();

  public Object getCondolenceById(String id) {
    return condolences.getOrDefault(id, Map.of(
        "id", id,
        "status", "draft",
        "createdAt", Instant.now().toString()
    ));
  }
}
