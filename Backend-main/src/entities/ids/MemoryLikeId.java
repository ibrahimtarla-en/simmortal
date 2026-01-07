package entities.ids;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class MemoryLikeId implements Serializable {
  private UUID userId;
  private UUID memoryId;

  public MemoryLikeId() {}

  public MemoryLikeId(UUID userId, UUID memoryId) {
    this.userId = userId;
    this.memoryId = memoryId;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public UUID getMemoryId() {
    return memoryId;
  }

  public void setMemoryId(UUID memoryId) {
    this.memoryId = memoryId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    MemoryLikeId that = (MemoryLikeId) o;
    return Objects.equals(userId, that.userId) && Objects.equals(memoryId, that.memoryId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(userId, memoryId);
  }
}
