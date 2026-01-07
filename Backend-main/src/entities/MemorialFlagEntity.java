package entities;

import entities.enums.MemorialFlagReason;
import entities.enums.MemorialFlagStatus;
import entities.enums.MemorialFlagType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "memorial_flag")
public class MemorialFlagEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamptz")
  private OffsetDateTime createdAt;

  @Column(name = "status_updated_at", columnDefinition = "timestamptz")
  private OffsetDateTime statusUpdatedAt;

  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @OneToOne
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  private UserEntity user;

  @Column(name = "memorial_id", columnDefinition = "uuid")
  private UUID memorialId;

  @OneToOne
  @JoinColumn(name = "memorial_id", insertable = false, updatable = false)
  private MemorialEntity memorial;

  @Column(name = "actor_id", columnDefinition = "uuid")
  private UUID actorId;

  @OneToOne
  @JoinColumn(name = "actor_id", insertable = false, updatable = false)
  private UserEntity actor;

  @Column(name = "reference_id", columnDefinition = "uuid")
  private UUID referenceId;

  @Column(name = "type")
  private MemorialFlagType type;

  @Column(name = "status")
  private MemorialFlagStatus status = MemorialFlagStatus.OPEN;

  @Column(name = "reason")
  private MemorialFlagReason reason;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getStatusUpdatedAt() {
    return statusUpdatedAt;
  }

  public void setStatusUpdatedAt(OffsetDateTime statusUpdatedAt) {
    this.statusUpdatedAt = statusUpdatedAt;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public UserEntity getUser() {
    return user;
  }

  public void setUser(UserEntity user) {
    this.user = user;
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

  public UUID getActorId() {
    return actorId;
  }

  public void setActorId(UUID actorId) {
    this.actorId = actorId;
  }

  public UserEntity getActor() {
    return actor;
  }

  public void setActor(UserEntity actor) {
    this.actor = actor;
  }

  public UUID getReferenceId() {
    return referenceId;
  }

  public void setReferenceId(UUID referenceId) {
    this.referenceId = referenceId;
  }

  public MemorialFlagType getType() {
    return type;
  }

  public void setType(MemorialFlagType type) {
    this.type = type;
  }

  public MemorialFlagStatus getStatus() {
    return status;
  }

  public void setStatus(MemorialFlagStatus status) {
    this.status = status;
  }

  public MemorialFlagReason getReason() {
    return reason;
  }

  public void setReason(MemorialFlagReason reason) {
    this.reason = reason;
  }
}
