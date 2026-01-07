import {
  MemorialContributionStatus,
  MemorialDonationWreath,
  PublishedMemorial,
} from 'src/memorial/interface/memorial.interface';

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
  createdAt: Date;
  wreath: MemorialDonationWreath;
  totalLikes: number;
  isLikedByUser?: boolean;
  memorialSlug: string;
}

export interface DonationWithMemorialInfo extends Donation {
  memorial: PublishedMemorial;
}
