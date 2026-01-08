package com.simmortal.memorial;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class CondolenceRepository {
  private final Map<String, Map<String, Object>> condolences = new ConcurrentHashMap<>();

  public Object getCondolenceById(String id) {
    return condolences.get(id);
  }

  public Map<String, Object> save(Map<String, Object> condolence) {
    condolences.put(condolence.get("id").toString(), condolence);
    return condolence;
  }

  public List<Map<String, Object>> listOwned(String userId) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> condolence : condolences.values()) {
      if (userId.equals(condolence.get("userId"))) {
        results.add(condolence);
      }
    }
    return results;
  }

  public List<Map<String, Object>> listLiked(String userId) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> condolence : condolences.values()) {
      Object likedBy = condolence.get("likedBy");
      if (likedBy instanceof List<?> list && list.contains(userId)) {
        results.add(condolence);
      }
    }
    return results;
  }
}
