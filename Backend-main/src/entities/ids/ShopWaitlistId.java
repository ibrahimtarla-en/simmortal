package entities.ids;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ShopWaitlistId implements Serializable {
  private UUID userId;
  private UUID itemId;

  public ShopWaitlistId() {}

  public ShopWaitlistId(UUID userId, UUID itemId) {
    this.userId = userId;
    this.itemId = itemId;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public UUID getItemId() {
    return itemId;
  }

  public void setItemId(UUID itemId) {
    this.itemId = itemId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ShopWaitlistId that = (ShopWaitlistId) o;
    return Objects.equals(userId, that.userId) && Objects.equals(itemId, that.itemId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(userId, itemId);
  }
}
