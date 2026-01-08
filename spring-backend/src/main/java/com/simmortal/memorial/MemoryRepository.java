package com.simmortal.memorial;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class MemoryRepository {
  private final Map<String, Map<String, Object>> memories = new ConcurrentHashMap<>();

  public Object getMemoryById(String id) {
    return memories.get(id);
  }

  public Map<String, Object> save(Map<String, Object> memory) {
    memories.put(memory.get("id").toString(), memory);
    return memory;
  }

  public List<Map<String, Object>> listOwned(String userId) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> memory : memories.values()) {
      if (userId.equals(memory.get("userId"))) {
        results.add(memory);
      }
    }
    return results;
  }

  public List<Map<String, Object>> listLiked(String userId) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> memory : memories.values()) {
      Object likedBy = memory.get("likedBy");
      if (likedBy instanceof List<?> list && list.contains(userId)) {
        results.add(memory);
      }
    }
    return results;
  }
}
