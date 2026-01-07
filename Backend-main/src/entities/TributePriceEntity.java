package entities;

import entities.enums.MemorialTribute;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "tribute_price")
public class TributePriceEntity {
  @Id
  @Column(name = "tribute")
  private MemorialTribute tribute;

  @Column(name = "price_in_cents")
  private Integer priceInCents;

  @UpdateTimestamp
  @Column(name = "updated_at", columnDefinition = "timestamptz")
  private OffsetDateTime updatedAt;

  public MemorialTribute getTribute() {
    return tribute;
  }

  public void setTribute(MemorialTribute tribute) {
    this.tribute = tribute;
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
