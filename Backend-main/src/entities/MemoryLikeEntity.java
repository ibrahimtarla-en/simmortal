package entities;

import entities.ids.MemoryLikeId;
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
@Table(name = "memory_like")
@IdClass(MemoryLikeId.class)
public class MemoryLikeEntity {
  @Id
  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @Id
  @Column(name = "memory_id", columnDefinition = "uuid")
  private UUID memoryId;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamp with time zone")
  private OffsetDateTime createdAt;

  @ManyToOne
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  private UserEntity user;

  @ManyToOne
  @JoinColumn(name = "memory_id", insertable = false, updatable = false)
  private MemoryEntity memory;

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public UUID getMemoryId() {
    return memoryId;
  }

  public void setMemoryId(UUID memoryId) {
    this.memoryId = memoryId;
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

  public MemoryEntity getMemory() {
    return memory;
  }

  public void setMemory(MemoryEntity memory) {
    this.memory = memory;
  }
}
