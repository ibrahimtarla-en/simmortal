package com.simmortal.memorial;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DonationService {
  private final DonationRepository donationRepository;

  public DonationService(DonationRepository donationRepository) {
    this.donationRepository = donationRepository;
  }

  public Object getOwnedDonations(
      MemorialContributionSortField sort,
      String cursor,
      String order,
      String userId
  ) {
    return List.of();
  }

  public Object getLikedDonations(
      MemorialContributionSortField sort,
      String cursor,
      String order,
      String userId
  ) {
    return List.of();
  }

  public Object getDonationById(String id) {
    return donationRepository.getDonationById(id);
  }
}
