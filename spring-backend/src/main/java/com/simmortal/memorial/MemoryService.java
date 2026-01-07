package com.simmortal.memorial;

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
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getOwnedMemories(
      MemorialContributionSortField sort,
      String cursor,
      String order,
      String userId
  ) {
    throw new UnsupportedOperationException("Not implemented yet");
  }

  public Object getMemoryById(String id) {
    return memoryRepository.getMemoryById(id);
  }
}
