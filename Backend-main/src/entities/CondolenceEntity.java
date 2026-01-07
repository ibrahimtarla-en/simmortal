package entities;

import entities.enums.MemorialContributionStatus;
import entities.enums.MemorialDecoration;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "condolence")
public class CondolenceEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "owner_id", columnDefinition = "uuid")
  private UUID ownerId;

  @ManyToOne
  @JoinColumn(name = "owner_id")
  private UserEntity owner;

  @Column(name = "memorial_id", columnDefinition = "uuid")
  private UUID memorialId;

  @OneToMany(mappedBy = "condolence")
  private List<CondolenceLikeEntity> likes;

  @ManyToOne
  @JoinColumn(name = "memorial_id")
  private MemorialEntity memorial;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamptz")
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", columnDefinition = "timestamptz")
  private OffsetDateTime updatedAt;

  @Column(name = "content")
  private String content;

  @Column(name = "decoration_new")
  private MemorialDecoration decoration;

  @Column(name = "status")
  private MemorialContributionStatus status = MemorialContributionStatus.DRAFT;

  @Column(name = "donation_count")
  private Long donationCount = 0L;

  @Column(name = "checkout_session_id")
  private String checkoutSessionId;

  @Formula("(SELECT COUNT(*) FROM condolence_like cl WHERE cl.condolence_id = id)")
  private Integer totalLikes;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(UUID ownerId) {
    this.ownerId = ownerId;
  }

  public UserEntity getOwner() {
    return owner;
  }

  public void setOwner(UserEntity owner) {
    this.owner = owner;
  }

  public UUID getMemorialId() {
    return memorialId;
  }

  public void setMemorialId(UUID memorialId) {
    this.memorialId = memorialId;
  }

  public List<CondolenceLikeEntity> getLikes() {
    return likes;
  }

  public void setLikes(List<CondolenceLikeEntity> likes) {
    this.likes = likes;
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

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public MemorialDecoration getDecoration() {
    return decoration;
  }

  public void setDecoration(MemorialDecoration decoration) {
    this.decoration = decoration;
  }

  public MemorialContributionStatus getStatus() {
    return status;
  }

  public void setStatus(MemorialContributionStatus status) {
    this.status = status;
  }

  public Long getDonationCount() {
    return donationCount;
  }

  public void setDonationCount(Long donationCount) {
    this.donationCount = donationCount;
  }

  public String getCheckoutSessionId() {
    return checkoutSessionId;
  }

  public void setCheckoutSessionId(String checkoutSessionId) {
    this.checkoutSessionId = checkoutSessionId;
  }

  public Integer getTotalLikes() {
    return totalLikes;
  }
}
