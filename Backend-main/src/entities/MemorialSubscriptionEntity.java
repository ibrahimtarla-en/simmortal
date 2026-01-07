package entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "memorial_subscription")
public class MemorialSubscriptionEntity {
  @Id
  @Column(name = "memorial_id", columnDefinition = "uuid")
  private UUID memorialId;

  @Column(name = "last_updated", columnDefinition = "timestamp with time zone")
  private OffsetDateTime lastUpdated;

  @Column(name = "subscription_id")
  private String subscriptionId;

  @ManyToOne
  @MapsId
  @JoinColumn(name = "memorial_id")
  private MemorialEntity memorial;

  public UUID getMemorialId() {
    return memorialId;
  }

  public void setMemorialId(UUID memorialId) {
    this.memorialId = memorialId;
  }

  public OffsetDateTime getLastUpdated() {
    return lastUpdated;
  }

  public void setLastUpdated(OffsetDateTime lastUpdated) {
    this.lastUpdated = lastUpdated;
  }

  public String getSubscriptionId() {
    return subscriptionId;
  }

  public void setSubscriptionId(String subscriptionId) {
    this.subscriptionId = subscriptionId;
  }

  public MemorialEntity getMemorial() {
    return memorial;
  }

  public void setMemorial(MemorialEntity memorial) {
    this.memorial = memorial;
  }
}
