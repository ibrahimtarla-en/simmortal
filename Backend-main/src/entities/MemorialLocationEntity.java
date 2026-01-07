package entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "memorial_location")
public class MemorialLocationEntity {
  @Id
  @Column(name = "memorial_id", columnDefinition = "uuid")
  private UUID memorialId;

  @Column(name = "latitude", columnDefinition = "double precision")
  private Double latitude;

  @Column(name = "longitude", columnDefinition = "double precision")
  private Double longitude;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamp with time zone")
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", columnDefinition = "timestamp with time zone")
  private OffsetDateTime updatedAt;

  @OneToOne
  @MapsId
  @JoinColumn(name = "memorial_id")
  private MemorialEntity memorial;

  public UUID getMemorialId() {
    return memorialId;
  }

  public void setMemorialId(UUID memorialId) {
    this.memorialId = memorialId;
  }

  public Double getLatitude() {
    return latitude;
  }

  public void setLatitude(Double latitude) {
    this.latitude = latitude;
  }

  public Double getLongitude() {
    return longitude;
  }

  public void setLongitude(Double longitude) {
    this.longitude = longitude;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public MemorialEntity getMemorial() {
    return memorial;
  }

  public void setMemorial(MemorialEntity memorial) {
    this.memorial = memorial;
  }
}
