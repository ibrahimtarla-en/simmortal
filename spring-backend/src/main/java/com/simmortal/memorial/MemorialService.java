package com.simmortal.memorial;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MemorialService {
  private final MemorialRepository memorialRepository;
  private final Map<String, Map<String, Object>> memorials = new ConcurrentHashMap<>();
  private final Map<String, Map<String, Object>> flags = new ConcurrentHashMap<>();
  private final Map<String, String> slugToId = new ConcurrentHashMap<>();

  public MemorialService(MemorialRepository memorialRepository) {
    this.memorialRepository = memorialRepository;
  }

  public Object createMemorial(String userId, Map<String, Object> request, MultipartFile image) {
    @SuppressWarnings("unchecked")
    Map<String, Object> memorial = (Map<String, Object>) memorialRepository.createMemorial(userId, request, image);
    memorials.put(memorial.get("id").toString(), memorial);
    slugToId.put(memorial.get("slug").toString(), memorial.get("id").toString());
    return memorial;
  }

  public Object searchMemorialByName(String query, Integer limit) {
    if (query == null || query.isBlank()) {
      return List.of();
    }
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> memorial : memorials.values()) {
      Object name = memorial.get("name");
      if (name != null && name.toString().toLowerCase().contains(query.toLowerCase())) {
        results.add(memorial);
      }
      if (limit != null && results.size() >= limit) {
        break;
      }
    }
    return results;
  }

  public Object getFeaturedMemorials(Integer limit) {
    List<Map<String, Object>> featured = new ArrayList<>();
    for (Map<String, Object> memorial : memorials.values()) {
      if (Boolean.TRUE.equals(memorial.get("featured"))) {
        featured.add(memorial);
      }
      if (limit != null && featured.size() >= limit) {
        break;
      }
    }
    return featured;
  }

  public Object createMemorialPreview(String memorialId, Map<String, Object> overrides) {
    Map<String, Object> memorial = new HashMap<>(memorials.getOrDefault(memorialId, Map.of()));
    if (overrides != null) {
      memorial.putAll(overrides);
    }
    memorial.put("preview", true);
    return memorial;
  }

  public Object getPublishMemorialPreview(String memorialId) {
    return createMemorialPreview(memorialId, Map.of("status", "preview"));
  }

  public boolean checkSlugAvailability(String slug, String memorialId) {
    String existing = slugToId.get(slug);
    return existing == null || existing.equals(memorialId);
  }

  public Object getPremiumSubscriptionPrices() {
    return Map.of(
        "monthly", "9.99",
        "yearly", "99.99"
    );
  }

  public Object createPremiumSubscriptionLink(String userId, String memorialId, String period) {
    Map<String, Object> response = new HashMap<>();
    response.put("checkoutUrl", "https://checkout.simmortals.com/memorial/" + memorialId);
    response.put("period", period);
    response.put("userId", userId);
    return response;
  }

  public Object validateSubscriptionResult(String sessionId, Boolean publishOnValidation) {
    Map<String, Object> response = new HashMap<>();
    response.put("sessionId", sessionId);
    response.put("published", Boolean.TRUE.equals(publishOnValidation));
    return response;
  }

  public Object publishFreeMemorial(String userId, String memorialId) {
    Map<String, Object> memorial = memorials.get(memorialId);
    if (memorial == null) {
      return null;
    }
    memorial.put("status", "published");
    memorial.put("publishedAt", Instant.now().toString());
    return memorial;
  }

  public Object getPublishedMemorial(String slug, String userId) {
    String memorialId = slugToId.get(slug);
    return memorialId == null ? null : memorials.get(memorialId);
  }

  public Object getPublishedMemorialById(String id) {
    return memorials.get(id);
  }

  public void incrementMemorialViewBySlug(String slug, Object request) {
    String memorialId = slugToId.get(slug);
    if (memorialId == null) {
      return;
    }
    Map<String, Object> memorial = memorials.get(memorialId);
    int views = ((Number) memorial.getOrDefault("views", 0)).intValue();
    memorial.put("views", views + 1);
  }

  public String getMemorialIdBySlug(String slug) {
    return slugToId.get(slug);
  }

  public void likeMemorial(String memorialId, String userId) {
    Map<String, Object> memorial = memorials.get(memorialId);
    if (memorial == null) {
      return;
    }
    int likes = ((Number) memorial.getOrDefault("likes", 0)).intValue();
    memorial.put("likes", likes + 1);
  }

  public void unlikeMemorial(String memorialId, String userId) {
    Map<String, Object> memorial = memorials.get(memorialId);
    if (memorial == null) {
      return;
    }
    int likes = ((Number) memorial.getOrDefault("likes", 0)).intValue();
    memorial.put("likes", Math.max(0, likes - 1));
  }

  public Object getMemorial(String userId, String memorialId, Boolean recommendSlug) {
    Map<String, Object> memorial = memorials.get(memorialId);
    if (memorial == null) {
      return null;
    }
    if (recommendSlug != null) {
      memorial.put("recommendSlug", recommendSlug);
    }
    return memorial;
  }

  public Object getOwnedMemorialPreviews(String userId) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> memorial : memorials.values()) {
      if (userId.equals(memorial.get("userId"))) {
        results.add(memorial);
      }
    }
    return results;
  }

  public Object updateMemorial(
      String userId,
      String memorialId,
      Map<String, Object> request,
      MultipartFile image,
      MultipartFile coverImage
  ) {
    Map<String, Object> memorial = memorials.get(memorialId);
    if (memorial == null) {
      return null;
    }
    memorial.putAll(request);
    memorial.put("updatedAt", Instant.now().toString());
    return memorial;
  }

  public Object deleteMemorial(String userId, String memorialId) {
    return memorialRepository.deleteMemorial(memorialId, userId);
  }

  public void createMemorialFlag(
      String userId,
      MemorialFlagType type,
      String referenceId,
      String reason
  ) {
    String id = UUID.randomUUID().toString();
    Map<String, Object> flag = new HashMap<>();
    flag.put("id", id);
    flag.put("userId", userId);
    flag.put("type", type.getValue());
    flag.put("referenceId", referenceId);
    flag.put("reason", reason);
    flag.put("status", MemorialFlagStatus.OPEN.getValue());
    flag.put("createdAt", Instant.now().toString());
    flags.put(id, flag);
  }

  public Object getMemorialFlags(String userId, String slug) {
    return new ArrayList<>(flags.values());
  }

  public void handleMemorialUpdateFlag(String userId, String flagId, MemorialFlagStatus status) {
    Map<String, Object> flag = flags.get(flagId);
    if (flag != null) {
      flag.put("status", status.getValue());
      flag.put("updatedAt", Instant.now().toString());
    }
  }

  public void verifyMemorialOwnership(String userId, String memorialId) {
    Map<String, Object> memorial = memorials.get(memorialId);
    if (memorial == null || !userId.equals(memorial.get("userId"))) {
      throw new IllegalStateException("Memorial not owned by user.");
    }
  }

  public Object getTopCandleContributors(String slug) {
    return List.of();
  }

  public Object getTopDonors(String slug) {
    return List.of();
  }

  public Object getTopFlowerContributors(String slug) {
    return List.of();
  }

  public Object getTopTreePlanters(String slug) {
    return List.of();
  }

  public Object getAdminMemorials() {
    return new ArrayList<>(memorials.values());
  }

  public Object getAdminMemorialById(String id) {
    return memorials.get(id);
  }

  public Object addFeaturedMemorial(String adminUserId, String id) {
    Map<String, Object> memorial = memorials.get(id);
    if (memorial == null) {
      return null;
    }
    memorial.put("featured", true);
    memorial.put("featuredAt", Instant.now().toString());
    return memorial;
  }

  public Object removeFeaturedMemorial(String adminUserId, String id) {
    Map<String, Object> memorial = memorials.get(id);
    if (memorial == null) {
      return null;
    }
    memorial.put("featured", false);
    memorial.put("featuredAt", null);
    return memorial;
  }

  public Object getOpenAdminFlags() {
    List<Map<String, Object>> openFlags = new ArrayList<>();
    for (Map<String, Object> flag : flags.values()) {
      if (MemorialFlagStatus.OPEN.getValue().equals(flag.get("status"))) {
        openFlags.add(flag);
      }
    }
    return openFlags;
  }
}
