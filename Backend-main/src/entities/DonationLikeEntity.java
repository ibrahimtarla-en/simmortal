package entities;

import entities.ids.DonationLikeId;
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
@Table(name = "donation_like")
@IdClass(DonationLikeId.class)
public class DonationLikeEntity {
  @Id
  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @Id
  @Column(name = "donation_id", columnDefinition = "uuid")
  private UUID donationId;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamp with time zone")
  private OffsetDateTime createdAt;

  @ManyToOne
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  private UserEntity user;

  @ManyToOne
  @JoinColumn(name = "donation_id", insertable = false, updatable = false)
  private DonationEntity donation;

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public UUID getDonationId() {
    return donationId;
  }

  public void setDonationId(UUID donationId) {
    this.donationId = donationId;
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

  public DonationEntity getDonation() {
    return donation;
  }

  public void setDonation(DonationEntity donation) {
    this.donation = donation;
  }
}
