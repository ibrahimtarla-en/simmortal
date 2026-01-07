package entities;

import entities.ids.ShopWaitlistId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "shop_waitlist")
@IdClass(ShopWaitlistId.class)
public class ShopWaitlistEntity {
  @Id
  @Column(name = "item_id", columnDefinition = "uuid")
  private UUID itemId;

  @Id
  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamptz")
  private OffsetDateTime createdAt;

  @ManyToOne
  @JoinColumn(name = "item_id", insertable = false, updatable = false)
  private ShopItemEntity item;

  @ManyToOne
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  private UserEntity user;

  public UUID getItemId() {
    return itemId;
  }

  public void setItemId(UUID itemId) {
    this.itemId = itemId;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public ShopItemEntity getItem() {
    return item;
  }

  public void setItem(ShopItemEntity item) {
    this.item = item;
  }

  public UserEntity getUser() {
    return user;
  }

  public void setUser(UserEntity user) {
    this.user = user;
  }
}
