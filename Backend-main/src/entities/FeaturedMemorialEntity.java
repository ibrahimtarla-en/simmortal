package entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "featured_memorial")
public class FeaturedMemorialEntity {
  @Id
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @OneToOne
  @JoinColumn(name = "id", insertable = false, updatable = false)
  private MemorialEntity memorial;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public MemorialEntity getMemorial() {
    return memorial;
  }

  public void setMemorial(MemorialEntity memorial) {
    this.memorial = memorial;
  }
}
