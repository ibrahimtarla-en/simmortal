package entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(
    name = "memorial_view_log",
    indexes = {
      @Index(name = "idx_memorial_view_log_memorial_ip_viewed", columnList = "memorial_id, ip_hash, viewed_at"),
      @Index(name = "idx_memorial_view_log_memorial", columnList = "memorial_id")
    })
public class MemorialViewLogEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "memorial_id", columnDefinition = "uuid")
  private UUID memorialId;

  @ManyToOne
  @JoinColumn(name = "memorial_id")
  private MemorialEntity memorial;

  @Column(name = "ip_hash")
  private String ipHash;

  @CreationTimestamp
  @Column(name = "viewed_at", columnDefinition = "timestamptz")
  private OffsetDateTime viewedAt;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getMemorialId() {
    return memorialId;
  }

  public void setMemorialId(UUID memorialId) {
    this.memorialId = memorialId;
  }

  public MemorialEntity getMemorial() {
    return memorial;
  }

  public void setMemorial(MemorialEntity memorial) {
    this.memorial = memorial;
  }

  public String getIpHash() {
    return ipHash;
  }

  public void setIpHash(String ipHash) {
    this.ipHash = ipHash;
  }

  public OffsetDateTime getViewedAt() {
    return viewedAt;
  }

  public void setViewedAt(OffsetDateTime viewedAt) {
    this.viewedAt = viewedAt;
  }
}
