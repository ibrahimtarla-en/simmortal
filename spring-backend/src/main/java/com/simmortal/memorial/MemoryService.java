package com.simmortal.memorial;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    List<Map<String, Object>> items = applySort(memoryRepository.listLiked(userId), sort, order);
    return buildPagedResponse(items, cursor);
  }

  public Object getOwnedMemories(
      MemorialContributionSortField sort,
      String cursor,
      String order,
      String userId
  ) {
    List<Map<String, Object>> items = applySort(memoryRepository.listOwned(userId), sort, order);
    return buildPagedResponse(items, cursor);
  }

  public Object getMemoryById(String id) {
    Object memory = memoryRepository.getMemoryById(id);
    if (memory == null) {
      Map<String, Object> fallback = new HashMap<>();
      fallback.put("id", id);
      fallback.put("status", "draft");
      fallback.put("createdAt", Instant.now().toString());
      return fallback;
    }
    return memory;
  }

  private List<Map<String, Object>> applySort(
      List<Map<String, Object>> items,
      MemorialContributionSortField sort,
      String order
  ) {
    Comparator<Map<String, Object>> comparator = Comparator.comparing(
        item -> item.getOrDefault("createdAt", "").toString()
    );
    if (sort == MemorialContributionSortField.LIKES) {
      comparator = Comparator.comparing(
          item -> ((Number) item.getOrDefault("totalLikes", 0)).intValue()
      );
    }
    if ("DESC".equalsIgnoreCase(order)) {
      comparator = comparator.reversed();
    }
    items.sort(comparator);
    return items;
  }

  private Map<String, Object> buildPagedResponse(List<Map<String, Object>> items, String cursor) {
    Map<String, Object> response = new HashMap<>();
    response.put("items", items);
    response.put("nextCursor", null);
    return response;
  }
}
