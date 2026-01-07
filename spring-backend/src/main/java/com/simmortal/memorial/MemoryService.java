package com.simmortal.memorial;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class MemoryService {
  private final MemoryRepository memoryRepository;

  public MemoryService(MemoryRepository memoryRepository) {
    this.memoryRepository = memoryRepository;
  }

  public Object getLikedMemories(
      MemorialContributionSortField sort,
      String cursor,
      String order,
      String userId
  ) {
    return List.of();
  }

  public Object getOwnedMemories(
      MemorialContributionSortField sort,
      String cursor,
      String order,
      String userId
  ) {
    return List.of();
  }

  public Object getMemoryById(String id) {
    return memoryRepository.getMemoryById(id);
  }
}
