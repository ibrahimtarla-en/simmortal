package entities;

import entities.enums.MemorialContributionStatus;
import entities.enums.MemorialDonationWreath;
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

@Entity
@Table(name = "donation")
public class DonationEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "memorial_id", columnDefinition = "uuid")
  private UUID memorialId;

  @ManyToOne
  @JoinColumn(name = "memorial_id")
  private MemorialEntity memorial;

  @Column(name = "owner_id", columnDefinition = "uuid")
  private UUID ownerId;

  @ManyToOne
  @JoinColumn(name = "owner_id")
  private UserEntity owner;

  @OneToMany(mappedBy = "donation")
  private List<DonationLikeEntity> likes;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamptz")
  private OffsetDateTime createdAt;

  @Column(name = "item_count")
  private Long itemCount;

  @Column(name = "value_in_cents")
  private Long valueInCents;

  @Column(name = "wreath")
  private MemorialDonationWreath wreath;

  @Column(name = "status")
  private MemorialContributionStatus status = MemorialContributionStatus.DRAFT;

  @Column(name = "checkout_session_id")
  private String checkoutSessionId;

  @Formula("(SELECT COUNT(*) FROM donation_like dl WHERE dl.donation_id = id)")
  private Integer totalLikes;

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

  public List<DonationLikeEntity> getLikes() {
    return likes;
  }

  public void setLikes(List<DonationLikeEntity> likes) {
    this.likes = likes;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public Long getItemCount() {
    return itemCount;
  }

  public void setItemCount(Long itemCount) {
    this.itemCount = itemCount;
  }

  public Long getValueInCents() {
    return valueInCents;
  }

  public void setValueInCents(Long valueInCents) {
    this.valueInCents = valueInCents;
  }

  public MemorialDonationWreath getWreath() {
    return wreath;
  }

  public void setWreath(MemorialDonationWreath wreath) {
    this.wreath = wreath;
  }

  public MemorialContributionStatus getStatus() {
    return status;
  }

  public void setStatus(MemorialContributionStatus status) {
    this.status = status;
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
