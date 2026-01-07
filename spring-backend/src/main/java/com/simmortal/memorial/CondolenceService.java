package com.simmortal.memorial;

import org.springframework.stereotype.Service;

@Service
public class CondolenceService {
  private final CondolenceRepository condolenceRepository;

  public CondolenceService(CondolenceRepository condolenceRepository) {
    this.condolenceRepository = condolenceRepository;
  }

  public Object getLikedCondolences(
      MemorialContributionSortField sort,
      String cursor,
      String order,
      String userId
  ) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getOwnedCondolences(
      MemorialContributionSortField sort,
      String cursor,
      String order,
      String userId
  ) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getCondolenceById(String id) {
    return condolenceRepository.getCondolenceById(id);
  }
}
