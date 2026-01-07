package entities.ids;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class MemorialLikeId implements Serializable {
  private UUID userId;
  private UUID memorialId;

  public MemorialLikeId() {}

  public MemorialLikeId(UUID userId, UUID memorialId) {
    this.userId = userId;
    this.memorialId = memorialId;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public UUID getMemorialId() {
    return memorialId;
  }

  public void setMemorialId(UUID memorialId) {
    this.memorialId = memorialId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    MemorialLikeId that = (MemorialLikeId) o;
    return Objects.equals(userId, that.userId) && Objects.equals(memorialId, that.memorialId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(userId, memorialId);
  }
}
