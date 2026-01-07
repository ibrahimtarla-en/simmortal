package entities;

import entities.ids.MemorialLikeId;
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
@Table(name = "memorial_like")
@IdClass(MemorialLikeId.class)
public class MemorialLikeEntity {
  @Id
  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @Id
  @Column(name = "memorial_id", columnDefinition = "uuid")
  private UUID memorialId;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamp with time zone")
  private OffsetDateTime createdAt;

  @ManyToOne
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  private UserEntity user;

  @ManyToOne
  @JoinColumn(name = "memorial_id", insertable = false, updatable = false)
  private MemorialEntity memorial;

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public UUID getMemorialId() {
    return memorialId;
  }

  public void setMemorialId(UUID memorialId) {
    this.memorialId = memorialId;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public UserEntity getUser() {
    return user;
  }

  public void setUser(UserEntity user) {
    this.user = user;
  }

  public MemorialEntity getMemorial() {
    return memorial;
  }

  public void setMemorial(MemorialEntity memorial) {
    this.memorial = memorial;
  }
}
