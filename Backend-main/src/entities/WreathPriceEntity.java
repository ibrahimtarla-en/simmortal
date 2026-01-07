package entities;

import entities.enums.MemorialDonationWreath;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "wreath_price")
public class WreathPriceEntity {
  @Id
  @Column(name = "wreath")
  private MemorialDonationWreath wreath;

  @Column(name = "price_in_cents")
  private Integer priceInCents;

  @UpdateTimestamp
  @Column(name = "updated_at", columnDefinition = "timestamptz")
  private OffsetDateTime updatedAt;

  public MemorialDonationWreath getWreath() {
    return wreath;
  }

  public void setWreath(MemorialDonationWreath wreath) {
    this.wreath = wreath;
  }

  public Integer getPriceInCents() {
    return priceInCents;
  }

  public void setPriceInCents(Integer priceInCents) {
    this.priceInCents = priceInCents;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
