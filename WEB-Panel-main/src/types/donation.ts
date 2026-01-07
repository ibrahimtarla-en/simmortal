import { MemorialContributionStatus } from './contribution';
import { MemorialDonationWreath, PublishedMemorial } from './memorial';

export interface NewDonation {
  userId: string;
  slug: string;
  wreath: MemorialDonationWreath;
}

export interface Donation {
  id: string;
  status: MemorialContributionStatus;
  author: {
    name: string | null;
    verified: boolean;
    id: string;
  };
  createdAt: string;
  wreath: MemorialDonationWreath;
  totalLikes: number;
  isLikedByUser?: boolean;
  memorialSlug: string;
}

export interface CreateDonationRequest {
  wreath: MemorialDonationWreath;
}

export interface DonationWithMemorialInfo extends Donation {
  memorial: PublishedMemorial;
}

export function isDonationWithMemorialInfo(
  donation: Donation | DonationWithMemorialInfo,
): donation is DonationWithMemorialInfo {
  return (donation as DonationWithMemorialInfo).memorial !== undefined;
}
