package entities;

import entities.converters.JsonMapConverter;
import entities.enums.NotificationType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "notification")
public class NotificationEntity {
  @Id
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @ManyToOne
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  private UserEntity user;

  @Column(name = "actor_id", columnDefinition = "uuid")
  private UUID actorId;

  @ManyToOne
  @JoinColumn(name = "actor_id", insertable = false, updatable = false)
  private UserEntity actor;

  @Column(name = "reference_id", columnDefinition = "uuid")
  private UUID referenceId;

  @Column(name = "type")
  private NotificationType type;

  @Column(name = "is_read")
  private boolean isRead;

  @Column(name = "read_at", columnDefinition = "timestamp with time zone")
  private OffsetDateTime readAt;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamp with time zone")
  private OffsetDateTime createdAt;

  @Column(name = "redirect_url")
  private String redirectUrl;

  @Convert(converter = JsonMapConverter.class)
  @Column(name = "payload", columnDefinition = "jsonb")
  private Map<String, Object> payload;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
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

  public NotificationType getType() {
    return type;
  }

  public void setType(NotificationType type) {
    this.type = type;
  }

  public boolean isRead() {
    return isRead;
  }

  public void setRead(boolean read) {
    isRead = read;
  }

  public OffsetDateTime getReadAt() {
    return readAt;
  }

  public void setReadAt(OffsetDateTime readAt) {
    this.readAt = readAt;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public String getRedirectUrl() {
    return redirectUrl;
  }

  public void setRedirectUrl(String redirectUrl) {
    this.redirectUrl = redirectUrl;
  }

  public Map<String, Object> getPayload() {
    return payload;
  }

  public void setPayload(Map<String, Object> payload) {
    this.payload = payload;
  }
}
