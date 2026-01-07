package entities;

import entities.enums.UserAccountStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "user")
public class UserEntity {
  @Id
  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamptz")
  private OffsetDateTime createdAt;

  @Column(name = "deleted_at", columnDefinition = "timestamptz")
  private OffsetDateTime deletedAt;

  @Column(name = "display_name")
  private String displayName;

  @Column(name = "status")
  private UserAccountStatus status = UserAccountStatus.ACTIVE;

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

  public OffsetDateTime getDeletedAt() {
    return deletedAt;
  }

  public void setDeletedAt(OffsetDateTime deletedAt) {
    this.deletedAt = deletedAt;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public UserAccountStatus getStatus() {
    return status;
  }

  public void setStatus(UserAccountStatus status) {
    this.status = status;
  }
}
