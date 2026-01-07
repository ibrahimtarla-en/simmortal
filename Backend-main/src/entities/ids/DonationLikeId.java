package entities.ids;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class DonationLikeId implements Serializable {
  private UUID userId;
  private UUID donationId;

  public DonationLikeId() {}

  public DonationLikeId(UUID userId, UUID donationId) {
    this.userId = userId;
    this.donationId = donationId;
  }

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

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    DonationLikeId that = (DonationLikeId) o;
    return Objects.equals(userId, that.userId) && Objects.equals(donationId, that.donationId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(userId, donationId);
  }
}
