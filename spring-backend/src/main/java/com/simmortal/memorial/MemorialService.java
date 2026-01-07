package com.simmortal.memorial;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MemorialService {
  private final MemorialRepository memorialRepository;

  public MemorialService(MemorialRepository memorialRepository) {
    this.memorialRepository = memorialRepository;
  }

  public Object createMemorial(String userId, Map<String, Object> request, MultipartFile image) {
    return memorialRepository.createMemorial(userId, request, image);
  }

  public Object searchMemorialByName(String query, Integer limit) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getFeaturedMemorials(Integer limit) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object createMemorialPreview(String memorialId, Map<String, Object> overrides) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getPublishMemorialPreview(String memorialId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public boolean checkSlugAvailability(String slug, String memorialId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getPremiumSubscriptionPrices() {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object createPremiumSubscriptionLink(String userId, String memorialId, String period) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object validateSubscriptionResult(String sessionId, Boolean publishOnValidation) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object publishFreeMemorial(String userId, String memorialId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getPublishedMemorial(String slug, String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getPublishedMemorialById(String id) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void incrementMemorialViewBySlug(String slug, Object request) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public String getMemorialIdBySlug(String slug) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void likeMemorial(String memorialId, String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void unlikeMemorial(String memorialId, String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getMemorial(String userId, String memorialId, Boolean recommendSlug) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getOwnedMemorialPreviews(String userId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object updateMemorial(
      String userId,
      String memorialId,
      Map<String, Object> request,
      MultipartFile image,
      MultipartFile coverImage
  ) {
    throw new UnsupportedOperationException("Not implemented yet");
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
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getMemorialFlags(String userId, String slug) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void handleMemorialUpdateFlag(String userId, String flagId, MemorialFlagStatus status) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public void verifyMemorialOwnership(String userId, String memorialId) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getTopCandleContributors(String slug) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getTopDonors(String slug) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getTopFlowerContributors(String slug) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getTopTreePlanters(String slug) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getAdminMemorials() {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getAdminMemorialById(String id) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object addFeaturedMemorial(String adminUserId, String id) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object removeFeaturedMemorial(String adminUserId, String id) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getOpenAdminFlags() {
    throw new UnsupportedOperationException("Not implemented yet");
  }
}
