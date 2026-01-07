package entities;

import entities.enums.AiGreetingState;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "ai_greeting")
public class AiGreetingEntity {
  @Id
  @Column(name = "memorial_id", columnDefinition = "uuid")
  private UUID memorialId;

  @ManyToOne
  @MapsId
  @JoinColumn(name = "memorial_id")
  private MemorialEntity memorial;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamp with time zone")
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "last_updated", columnDefinition = "timestamp with time zone")
  private OffsetDateTime lastUpdated;

  @Column(name = "audio_path")
  private String audioPath;

  @Column(name = "image_path")
  private String imagePath;

  @Column(name = "video_path")
  private String videoPath;

  @Column(name = "state")
  private AiGreetingState state = AiGreetingState.READY;

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

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getLastUpdated() {
    return lastUpdated;
  }

  public void setLastUpdated(OffsetDateTime lastUpdated) {
    this.lastUpdated = lastUpdated;
  }

  public String getAudioPath() {
    return audioPath;
  }

  public void setAudioPath(String audioPath) {
    this.audioPath = audioPath;
  }

  public String getImagePath() {
    return imagePath;
  }

  public void setImagePath(String imagePath) {
    this.imagePath = imagePath;
  }

  public String getVideoPath() {
    return videoPath;
  }

  public void setVideoPath(String videoPath) {
    this.videoPath = videoPath;
  }

  public AiGreetingState getState() {
    return state;
  }

  public void setState(AiGreetingState state) {
    this.state = state;
  }
}
