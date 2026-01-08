package com.simmortal.memorial;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class DonationRepository {
  private final Map<String, Map<String, Object>> donations = new ConcurrentHashMap<>();

  public Object getDonationById(String id) {
    return donations.get(id);
  }

  public Map<String, Object> save(Map<String, Object> donation) {
    donations.put(donation.get("id").toString(), donation);
    return donation;
  }

  public List<Map<String, Object>> listOwned(String userId) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> donation : donations.values()) {
      if (userId.equals(donation.get("userId"))) {
        results.add(donation);
      }
    }
    return results;
  }

  public List<Map<String, Object>> listLiked(String userId) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> donation : donations.values()) {
      Object likedBy = donation.get("likedBy");
      if (likedBy instanceof List<?> list && list.contains(userId)) {
        results.add(donation);
      }
    }
    return results;
  }
}
