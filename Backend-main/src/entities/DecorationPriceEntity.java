package entities;

import entities.enums.MemorialDecoration;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "decoration_price")
public class DecorationPriceEntity {
  @Id
  @Column(name = "decoration")
  private MemorialDecoration decoration;

  @Column(name = "price_in_cents")
  private Integer priceInCents;

  @UpdateTimestamp
  @Column(name = "updated_at", columnDefinition = "timestamptz")
  private OffsetDateTime updatedAt;

  public MemorialDecoration getDecoration() {
    return decoration;
  }

  public void setDecoration(MemorialDecoration decoration) {
    this.decoration = decoration;
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
