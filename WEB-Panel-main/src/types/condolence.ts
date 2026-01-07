import { ContributionAuthor, MemorialContributionStatus } from './contribution';
import { MemorialDecoration, PublishedMemorial } from './memorial';

export interface CondolenceAboutForm {
  question: string;
  content: string;
}

export interface NewCondolence {
  userId: string;
  slug: string;
  content: string;
}

export interface Condolence {
  id: string;
  status: MemorialContributionStatus;
  author: ContributionAuthor;
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
export interface CreateCondolenceRequest {
  content: string;
}

export interface UpdateCondolencePayload {
  content: string;
  decoration: MemorialDecoration;
  donationCount: number;
}

export function isCondolanceWithMemorialInfo(
  condolence: Condolence | CondolenceWithMemorialInfo,
): condolence is CondolenceWithMemorialInfo {
  return (condolence as CondolenceWithMemorialInfo).memorial !== undefined;
}
