package entities;

import entities.ids.CondolenceLikeId;
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
@Table(name = "condolence_like")
@IdClass(CondolenceLikeId.class)
public class CondolenceLikeEntity {
  @Id
  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @Id
  @Column(name = "condolence_id", columnDefinition = "uuid")
  private UUID condolenceId;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamp with time zone")
  private OffsetDateTime createdAt;

  @ManyToOne
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  private UserEntity user;

  @ManyToOne
  @JoinColumn(name = "condolence_id", insertable = false, updatable = false)
  private CondolenceEntity condolence;

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public UUID getCondolenceId() {
    return condolenceId;
  }

  public void setCondolenceId(UUID condolenceId) {
    this.condolenceId = condolenceId;
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

  public CondolenceEntity getCondolence() {
    return condolence;
  }

  public void setCondolence(CondolenceEntity condolence) {
    this.condolence = condolence;
  }
}
