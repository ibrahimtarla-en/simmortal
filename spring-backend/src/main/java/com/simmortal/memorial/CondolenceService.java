package com.simmortal.memorial;

import java.util.List;
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
    return List.of();
  }

  public Object getOwnedCondolences(
      MemorialContributionSortField sort,
      String cursor,
      String order,
      String userId
  ) {
    return List.of();
  }

  public Object getCondolenceById(String id) {
    return condolenceRepository.getCondolenceById(id);
  }
}
