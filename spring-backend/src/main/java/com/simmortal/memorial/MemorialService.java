package com.simmortal.memorial;

import com.simmortal.storage.StorageService;
import com.simmortal.util.AssetService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MemorialService {
  private final MemorialRepository memorialRepository;
  private final StorageService storageService;
  private final AssetService assetService;
  private final Map<String, Map<String, Object>> flags = new ConcurrentHashMap<>();
  private final Map<String, String> slugToId = new ConcurrentHashMap<>();
  private final Map<String, Set<String>> likes = new ConcurrentHashMap<>();
  private final Set<String> bannedSlugs = Set.of("admin", "login", "asset", "api", "memorial");

  public MemorialService(
      MemorialRepository memorialRepository,
      StorageService storageService,
      AssetService assetService
  ) {
    this.memorialRepository = memorialRepository;
    this.storageService = storageService;
    this.assetService = assetService;
  }

  public Object createMemorial(String userId, Map<String, Object> request, MultipartFile image) {
    String id = UUID.randomUUID().toString();
    String name = request.getOrDefault("name", "Unnamed Memorial").toString();
    String requestedSlug = request.getOrDefault("slug", "").toString();
    String defaultSlug = requestedSlug.isBlank() ? buildSlug(name, id) : sanitizeSlug(requestedSlug);
    if (!checkSlugAvailability(defaultSlug, id)) {
      defaultSlug = buildSlug(name, id);
    }
    String imagePath = saveMemorialImage(id, image, "cover");
    Map<String, Object> memorial = new ConcurrentHashMap<>();
    memorial.put("id", id);
    memorial.put("userId", userId);
    memorial.put("name", name);
    memorial.put("defaultSlug", defaultSlug);
    memorial.put("premiumSlug", null);
    memorial.put("status", "draft");
    memorial.put("createdAt", Instant.now().toString());
    memorial.put("updatedAt", Instant.now().toString());
    memorial.put("imagePath", imagePath);
    memorial.put("coverImagePath", imagePath);
    memorial.put("featured", false);
    memorial.put("views", 0);
    memorial.put("likes", 0);
    memorialRepository.save(memorial);
    slugToId.put(defaultSlug, id);
    return enrichMemorial(memorial);
  }

  public Object searchMemorialByName(String query, Integer limit) {
    if (query == null || query.isBlank()) {
      return List.of();
    }
    List<Map<String, Object>> results = new ArrayList<>();
    String normalized = query.toLowerCase(Locale.ROOT);
    for (Map<String, Object> memorial : memorialRepository.getAllMemorials()) {
      Object name = memorial.get("name");
      if (name != null && name.toString().toLowerCase(Locale.ROOT).contains(normalized)) {
        results.add(enrichMemorial(memorial));
      }
      if (limit != null && results.size() >= limit) {
        break;
      }
    }
    return results;
  }

  public Object getFeaturedMemorials(Integer limit) {
    List<Map<String, Object>> featured = new ArrayList<>();
    for (Map<String, Object> memorial : memorialRepository.getAllMemorials()) {
      if (Boolean.TRUE.equals(memorial.get("featured"))) {
        featured.add(enrichMemorial(memorial));
      }
      if (limit != null && featured.size() >= limit) {
        break;
      }
    }
    return featured;
  }

  public Object createMemorialPreview(String memorialId, Map<String, Object> overrides) {
    Map<String, Object> memorial = memorialRepository.getMemorialById(memorialId);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    Map<String, Object> preview = new HashMap<>(memorial);
    if (overrides != null) {
      preview.putAll(overrides);
    }
    preview.put("preview", true);
    preview.put("status", "preview");
    return enrichMemorial(preview);
  }

  public Object getPublishMemorialPreview(String memorialId) {
    return createMemorialPreview(memorialId, Map.of("status", "preview"));
  }

  public boolean checkSlugAvailability(String slug, String memorialId) {
    String normalized = sanitizeSlug(slug);
    if (normalized.isBlank() || bannedSlugs.contains(normalized)) {
      return false;
    }
    String existing = slugToId.get(normalized);
    if (existing != null && !existing.equals(memorialId)) {
      return false;
    }
    return memorialRepository.findBySlug(normalized).map(found -> found.get("id").toString().equals(memorialId)).orElse(true);
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
    Map<String, Object> memorial = memorialRepository.getMemorialById(memorialId);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    ensureOwner(memorial, userId);
    memorial.put("status", "published");
    memorial.put("publishedAt", Instant.now().toString());
    memorial.put("updatedAt", Instant.now().toString());
    memorialRepository.save(memorial);
    return enrichMemorial(memorial);
  }

  public Object getPublishedMemorial(String slug, String userId) {
    String memorialId = getMemorialIdBySlug(slug);
    Map<String, Object> memorial = memorialId == null ? null : memorialRepository.getMemorialById(memorialId);
    if (memorial == null || !"published".equals(memorial.get("status"))) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    Map<String, Object> response = enrichMemorial(memorial);
    if (userId != null) {
      response.put("likedByUser", likes.getOrDefault(memorialId, Set.of()).contains(userId));
    }
    return response;
  }

  public Object getPublishedMemorialById(String id) {
    Map<String, Object> memorial = memorialRepository.getMemorialById(id);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    return enrichMemorial(memorial);
  }

  public void incrementMemorialViewBySlug(String slug, Object request) {
    String memorialId = getMemorialIdBySlug(slug);
    if (memorialId == null) {
      return;
    }
    Map<String, Object> memorial = memorialRepository.getMemorialById(memorialId);
    if (memorial == null) {
      return;
    }
    int views = ((Number) memorial.getOrDefault("views", 0)).intValue();
    memorial.put("views", views + 1);
    memorial.put("updatedAt", Instant.now().toString());
    memorialRepository.save(memorial);
  }

  public String getMemorialIdBySlug(String slug) {
    String id = slugToId.get(slug);
    if (id != null) {
      return id;
    }
    return memorialRepository.findBySlug(slug).map(memorial -> memorial.get("id").toString()).orElse(null);
  }

  public void likeMemorial(String memorialId, String userId) {
    Map<String, Object> memorial = memorialRepository.getMemorialById(memorialId);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    Set<String> likedUsers = likes.computeIfAbsent(memorialId, id -> new HashSet<>());
    if (likedUsers.add(userId)) {
      int totalLikes = ((Number) memorial.getOrDefault("likes", 0)).intValue() + 1;
      memorial.put("likes", totalLikes);
      memorialRepository.save(memorial);
    }
  }

  public void unlikeMemorial(String memorialId, String userId) {
    Map<String, Object> memorial = memorialRepository.getMemorialById(memorialId);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    Set<String> likedUsers = likes.getOrDefault(memorialId, new HashSet<>());
    if (likedUsers.remove(userId)) {
      int totalLikes = ((Number) memorial.getOrDefault("likes", 0)).intValue();
      memorial.put("likes", Math.max(0, totalLikes - 1));
      memorialRepository.save(memorial);
    }
  }

  public Object getMemorial(String userId, String memorialId, Boolean recommendSlug) {
    Map<String, Object> memorial = memorialRepository.getMemorialById(memorialId);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    ensureOwner(memorial, userId);
    Map<String, Object> response = enrichMemorial(memorial);
    if (Boolean.TRUE.equals(recommendSlug)) {
      response.put("recommendedSlug", buildSlug(memorial.get("name").toString(), memorialId));
    }
    return response;
  }

  public Object getOwnedMemorialPreviews(String userId) {
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> memorial : memorialRepository.getMemorialsByOwner(userId)) {
      results.add(enrichMemorial(memorial));
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
    Map<String, Object> memorial = memorialRepository.getMemorialById(memorialId);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    ensureOwner(memorial, userId);
    if (request != null) {
      memorial.putAll(request);
    }
    if (request != null && request.get("defaultSlug") != null) {
      String nextSlug = sanitizeSlug(request.get("defaultSlug").toString());
      if (!checkSlugAvailability(nextSlug, memorialId)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug already in use");
      }
      String previousSlug = memorial.getOrDefault("defaultSlug", "").toString();
      memorial.put("defaultSlug", nextSlug);
      slugToId.remove(previousSlug);
      slugToId.put(nextSlug, memorialId);
    }
    if (request != null && request.get("premiumSlug") != null) {
      String nextSlug = sanitizeSlug(request.get("premiumSlug").toString());
      if (!checkSlugAvailability(nextSlug, memorialId)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug already in use");
      }
      memorial.put("premiumSlug", nextSlug);
      slugToId.put(nextSlug, memorialId);
    }
    if (image != null) {
      String imagePath = saveMemorialImage(memorialId, image, "portrait");
      memorial.put("imagePath", imagePath);
    }
    if (coverImage != null) {
      String coverImagePath = saveMemorialImage(memorialId, coverImage, "cover");
      memorial.put("coverImagePath", coverImagePath);
    }
    memorial.put("updatedAt", Instant.now().toString());
    memorialRepository.save(memorial);
    return enrichMemorial(memorial);
  }

  public Object deleteMemorial(String userId, String memorialId) {
    Map<String, Object> memorial = memorialRepository.getMemorialById(memorialId);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    ensureOwner(memorial, userId);
    memorial.put("status", "removed");
    memorial.put("deletedBy", userId);
    memorial.put("deletedAt", Instant.now().toString());
    memorialRepository.save(memorial);
    return memorial;
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
    if (type == MemorialFlagType.MEMORIAL_REPORT) {
      flag.put("memorialId", referenceId);
    }
    flags.put(id, flag);
  }

  public Object getMemorialFlags(String userId, String slug) {
    String memorialId = getMemorialIdBySlug(slug);
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> flag : flags.values()) {
      if (memorialId != null && memorialId.equals(flag.get("memorialId"))) {
        results.add(flag);
      }
    }
    return results;
  }

  public void handleMemorialUpdateFlag(String userId, String flagId, MemorialFlagStatus status) {
    Map<String, Object> flag = flags.get(flagId);
    if (flag != null) {
      flag.put("status", status.getValue());
      flag.put("updatedAt", Instant.now().toString());
    }
  }

  public void verifyMemorialOwnership(String userId, String memorialId) {
    Map<String, Object> memorial = memorialRepository.getMemorialById(memorialId);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    ensureOwner(memorial, userId);
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
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> memorial : memorialRepository.getAllMemorials()) {
      results.add(enrichMemorial(memorial));
    }
    return results;
  }

  public Object getAdminMemorialById(String id) {
    Map<String, Object> memorial = memorialRepository.getMemorialById(id);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    return enrichMemorial(memorial);
  }

  public Object addFeaturedMemorial(String adminUserId, String id) {
    Map<String, Object> memorial = memorialRepository.getMemorialById(id);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    memorial.put("featured", true);
    memorial.put("featuredAt", Instant.now().toString());
    memorialRepository.save(memorial);
    return enrichMemorial(memorial);
  }

  public Object removeFeaturedMemorial(String adminUserId, String id) {
    Map<String, Object> memorial = memorialRepository.getMemorialById(id);
    if (memorial == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Memorial not found");
    }
    memorial.put("featured", false);
    memorial.put("featuredAt", null);
    memorialRepository.save(memorial);
    return enrichMemorial(memorial);
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

  private String buildSlug(String name, String memorialId) {
    String base = sanitizeSlug(name);
    if (base.isBlank()) {
      base = "memorial";
    }
    String slug = base;
    if (!checkSlugAvailability(slug, memorialId)) {
      slug = base + "-" + memorialId.substring(0, 6);
    }
    return slug;
  }

  private String sanitizeSlug(String value) {
    String sanitized = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    sanitized = sanitized.replaceAll("[^a-z0-9\\s-]", "");
    sanitized = sanitized.replaceAll("\\s+", "-");
    sanitized = sanitized.replaceAll("-{2,}", "-");
    return sanitized;
  }

  private String saveMemorialImage(String memorialId, MultipartFile image, String type) {
    String extension = "png";
    if (image != null && image.getContentType() != null && image.getContentType().contains("/")) {
      extension = image.getContentType().split("/")[1];
    }
    String path = String.format("memorial/%s/%s-%d.%s", memorialId, type, System.currentTimeMillis(), extension);
    try {
      storageService.save(path, image.getBytes(), image.getContentType());
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save memorial image");
    }
    return path;
  }

  private void ensureOwner(Map<String, Object> memorial, String userId) {
    if (!userId.equals(memorial.get("userId"))) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
    }
  }

  private Map<String, Object> enrichMemorial(Map<String, Object> memorial) {
    Map<String, Object> enriched = new HashMap<>(memorial);
    Object imagePath = memorial.get("imagePath");
    Object coverImagePath = memorial.get("coverImagePath");
    if (imagePath != null) {
      enriched.put("imagePath", assetService.generateAssetUrl(imagePath.toString()));
    }
    if (coverImagePath != null) {
      enriched.put("coverImagePath", assetService.generateAssetUrl(coverImagePath.toString()));
    }
    return enriched;
  }
}
