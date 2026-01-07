package entities;

import entities.converters.TimelineMemoryListConverter;
import entities.types.TimelineMemory;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "memorial_timeline")
public class MemorialTimelineEntity {
  @Id
  @Column(name = "memorial_id", columnDefinition = "uuid")
  private UUID memorialId;

  @Convert(converter = TimelineMemoryListConverter.class)
  @Column(name = "timeline", columnDefinition = "jsonb")
  private List<TimelineMemory> timeline;

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

  public List<TimelineMemory> getTimeline() {
    return timeline;
  }

  public void setTimeline(List<TimelineMemory> timeline) {
    this.timeline = timeline;
  }

  public MemorialEntity getMemorial() {
    return memorial;
  }

  public void setMemorial(MemorialEntity memorial) {
    this.memorial = memorial;
  }
}
