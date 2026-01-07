package com.simmortal.memorial;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class DonationRepository {
  private final Map<String, Map<String, Object>> donations = new ConcurrentHashMap<>();

  public Object getDonationById(String id) {
    return donations.getOrDefault(id, Map.of(
        "id", id,
        "status", "draft",
        "createdAt", Instant.now().toString()
    ));
  }
}
