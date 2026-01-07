package entities.ids;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class CondolenceLikeId implements Serializable {
  private UUID userId;
  private UUID condolenceId;

  public CondolenceLikeId() {}

  public CondolenceLikeId(UUID userId, UUID condolenceId) {
    this.userId = userId;
    this.condolenceId = condolenceId;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public UUID getCondolenceId() {
    return condolenceId;
  }

  public void setCondolenceId(UUID condolenceId) {
    this.condolenceId = condolenceId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CondolenceLikeId that = (CondolenceLikeId) o;
    return Objects.equals(userId, that.userId) && Objects.equals(condolenceId, that.condolenceId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(userId, condolenceId);
  }
}
