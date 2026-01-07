package com.simmortal.memorial;

import com.simmortal.ai.AiService;
import com.simmortal.util.AssetService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("memorial")
public class MemorialController {
  private final MemorialService memorialService;
  private final AiService aiService;
  private final AssetService assetService;

  public MemorialController(MemorialService memorialService, AiService aiService, AssetService assetService) {
    this.memorialService = memorialService;
    this.aiService = aiService;
    this.assetService = assetService;
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Object createMemorial(
      @RequestHeader("X-User-Id") String userId,
      @RequestPart("data") Map<String, Object> request,
      @RequestPart("image") MultipartFile image
  ) {
    return memorialService.createMemorial(userId, request, image);
  }

  @GetMapping("search")
  public Object searchMemorials(
      @RequestParam("query") String query,
      @RequestParam("limit") Integer limit
  ) {
    return memorialService.searchMemorialByName(query, limit);
  }

  @GetMapping("featured")
  public Object getFeaturedMemorials(@RequestParam("limit") Integer limit) {
    return memorialService.getFeaturedMemorials(limit);
  }

  @PostMapping("preview/{memorialId}")
  public Object createMemorialPreview(
      @PathVariable String memorialId,
      @RequestBody Map<String, Object> overrides
  ) {
    return memorialService.createMemorialPreview(memorialId, overrides);
  }

  @GetMapping("publish-preview/{memorialId}")
  public Object getMemorialPreview(@PathVariable String memorialId) {
    return memorialService.getPublishMemorialPreview(memorialId);
  }

  @PostMapping(value = "transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, Object> transcribeAudio(@RequestPart("audio") MultipartFile audio) {
    String transcription = aiService.transcribeAudio(audio);
    Map<String, Object> response = new HashMap<>();
    response.put("transcription", transcription);
    return response;
  }

  @PostMapping("check-slug")
  public Map<String, Object> checkSlugAvailability(@RequestBody CheckSlugAvailabilityRequest request) {
    boolean isAvailable = memorialService.checkSlugAvailability(request.slug(), request.memorialId());
    Map<String, Object> response = new HashMap<>();
    response.put("isAvailable", isAvailable);
    return response;
  }

  @GetMapping("premium-prices")
  public Object getPremiumSubscriptionPrices() {
    return memorialService.getPremiumSubscriptionPrices();
  }

  @PostMapping("purchase-premium/{memorialId}")
  public Object purchasePremiumMemorial(
      @RequestHeader("X-User-Id") String userId,
      @PathVariable String memorialId,
      @RequestBody PurchasePremiumMemorialRequest request
  ) {
    return memorialService.createPremiumSubscriptionLink(userId, memorialId, request.period());
  }

  @PostMapping("validate-subscription/{sessionId}")
  public Object validateSubscriptionResult(
      @PathVariable String sessionId,
      @RequestBody ValidateSubscriptionRequest request
  ) {
    return memorialService.validateSubscriptionResult(sessionId, request.publishOnValidation());
  }

  @PostMapping("publish-free/{memorialId}")
  public Object publishFreeMemorial(
      @RequestHeader("X-User-Id") String userId,
      @PathVariable String memorialId
  ) {
    return memorialService.publishFreeMemorial(userId, memorialId);
  }

  @GetMapping("published/{slug}")
  public Object getPublishedMemorial(
      @PathVariable String slug,
      @RequestHeader(value = "X-User-Id", required = false) String userId
  ) {
    return memorialService.getPublishedMemorial(slug, userId);
  }

  @GetMapping("published/id/{id}")
  public Object getPublishedMemorialById(@PathVariable String id) {
    return memorialService.getPublishedMemorialById(id);
  }

  @PostMapping("published/{slug}/view")
  public void logPublishedMemorialView(@PathVariable String slug, HttpServletRequest request) {
    memorialService.incrementMemorialViewBySlug(slug, request);
  }

  @PostMapping("published/{slug}/like")
  public void likePublishedMemorial(
      @PathVariable String slug,
      @RequestHeader("X-User-Id") String userId
  ) {
    String memorialId = memorialService.getMemorialIdBySlug(slug);
    if (memorialId == null) {
      throw new IllegalStateException("Memorial not found");
    }
    memorialService.likeMemorial(memorialId, userId);
  }

  @DeleteMapping("published/{slug}/like")
  public void unlikePublishedMemorial(
      @PathVariable String slug,
      @RequestHeader("X-User-Id") String userId
  ) {
    String memorialId = memorialService.getMemorialIdBySlug(slug);
    if (memorialId == null) {
      throw new IllegalStateException("Memorial not found");
    }
    memorialService.unlikeMemorial(memorialId, userId);
  }

  @GetMapping("owned/{memorialId}")
  public Object getMemorial(
      @RequestHeader("X-User-Id") String userId,
      @PathVariable String memorialId,
      @RequestParam(value = "recommendSlug", required = false) Boolean recommendSlug
  ) {
    return memorialService.getMemorial(userId, memorialId, recommendSlug);
  }

  @GetMapping("owned-preview")
  public Object getOwnedMemorials(@RequestHeader("X-User-Id") String userId) {
    return memorialService.getOwnedMemorialPreviews(userId);
  }

  @PatchMapping(value = "owned/{memorialId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Object updateMemorial(
      @RequestHeader("X-User-Id") String userId,
      @PathVariable String memorialId,
      @RequestPart("data") Map<String, Object> request,
      @RequestPart(value = "image", required = false) MultipartFile image,
      @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
  ) {
    return memorialService.updateMemorial(userId, memorialId, request, image, coverImage);
  }

  @DeleteMapping("owned/{memorialId}")
  public Object deleteMemorial(
      @RequestHeader("X-User-Id") String userId,
      @PathVariable String memorialId
  ) {
    return memorialService.deleteMemorial(userId, memorialId);
  }

  @PostMapping("published/flag")
  public void flagPublishedMemorial(
      @RequestHeader("X-User-Id") String userId,
      @RequestBody CreateMemorialFlagRequest request
  ) {
    if (request.type() != MemorialFlagType.CONDOLENCE_REPORT
        && request.type() != MemorialFlagType.MEMORY_REPORT
        && request.type() != MemorialFlagType.MEMORIAL_REPORT
        && request.type() != MemorialFlagType.DONATION_REPORT) {
      throw new IllegalArgumentException("Invalid flag type");
    }
    memorialService.createMemorialFlag(userId, request.type(), request.referenceId(), request.reason());
  }

  @GetMapping("published/{slug}/flag")
  public Object getMemorialFlags(
      @RequestHeader("X-User-Id") String userId,
      @PathVariable String slug
  ) {
    return memorialService.getMemorialFlags(userId, slug);
  }

  @PatchMapping("flag/{flagId}")
  public void handleMemorialFlag(
      @RequestHeader("X-User-Id") String userId,
      @PathVariable String flagId,
      @RequestBody Map<String, String> request
  ) {
    MemorialFlagStatus status = MemorialFlagStatus.fromValue(request.get("status"));
    memorialService.handleMemorialUpdateFlag(userId, flagId, status);
  }

  @GetMapping("ai-greeting/{memorialId}")
  public Object getMemorialAiGreeting(
      @PathVariable String memorialId,
      @RequestHeader("X-User-Id") String userId
  ) {
    memorialService.verifyMemorialOwnership(userId, memorialId);
    return aiService.getAiGreeting(memorialId);
  }

  @DeleteMapping("ai-greeting/{memorialId}")
  public void deleteMemorialAiVoice(
      @PathVariable String memorialId,
      @RequestHeader("X-User-Id") String userId
  ) {
    memorialService.verifyMemorialOwnership(userId, memorialId);
    aiService.resetAiGreetingCreation(memorialId);
  }

  @PostMapping(value = "ai-greeting/voice/{memorialId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, Object> createMemorialVoice(
      @PathVariable String memorialId,
      @RequestHeader("X-User-Id") String userId,
      @RequestPart("files") List<MultipartFile> files,
      @RequestParam(value = "locale", required = false) String locale
  ) {
    memorialService.verifyMemorialOwnership(userId, memorialId);
    String voiceId = aiService.createMemorialVoice(memorialId, files);
    String localeToUse = ("tr".equals(locale) || "en".equals(locale)) ? locale : "en";
    String path = aiService.createMemorialGreetingAudio(memorialId, voiceId, localeToUse);
    Map<String, Object> response = new HashMap<>();
    response.put("path", assetService.generateAssetUrl(path));
    return response;
  }

  @PostMapping(value = "ai-greeting/image/{memorialId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, Object> uploadAiGreetingImage(
      @PathVariable String memorialId,
      @RequestHeader("X-User-Id") String userId,
      @RequestPart("image") MultipartFile image
  ) {
    memorialService.verifyMemorialOwnership(userId, memorialId);
    String path = aiService.uploadAiGreetingImage(memorialId, image);
    Map<String, Object> response = new HashMap<>();
    response.put("path", assetService.generateAssetUrl(path));
    return response;
  }

  @GetMapping("published/{slug}/top-contributors/candles")
  public Object getTopCandleContributors(@PathVariable String slug) {
    return memorialService.getTopCandleContributors(slug);
  }

  @GetMapping("published/{slug}/top-contributors/donations")
  public Object getTopDonors(@PathVariable String slug) {
    return memorialService.getTopDonors(slug);
  }

  @GetMapping("published/{slug}/top-contributors/flowers")
  public Object getTopFlowerContributors(@PathVariable String slug) {
    return memorialService.getTopFlowerContributors(slug);
  }

  @GetMapping("published/{slug}/top-contributors/trees")
  public Object getTopTreePlanters(@PathVariable String slug) {
    return memorialService.getTopTreePlanters(slug);
  }
}
