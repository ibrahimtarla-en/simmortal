import {
  MemorialContributionStatus,
  MemorialDecoration,
  PublishedMemorial,
} from 'src/memorial/interface/memorial.interface';

export interface NewCondolence {
  userId: string;
  slug: string;
  content: string;
}

export interface Condolence {
  id: string;
  status: MemorialContributionStatus;
  author: {
    name: string | null;
    verified: boolean;
    id: string;
  };
  createdAt: Date;
  content: string;
  donationCount: number;
  decoration: MemorialDecoration | null;
  totalLikes: number;
  isLikedByUser?: boolean;
  memorialSlug: string;
}

export interface CondolenceWithMemorialInfo extends Condolence {
  memorial: PublishedMemorial;
}
