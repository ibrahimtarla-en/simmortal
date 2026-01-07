import {
  MemorialContributionStatus,
  MemorialDecoration,
  MemorialTribute,
  PublishedMemorial,
} from 'src/memorial/interface/memorial.interface';
import { AssetType } from 'src/types/asset';

export interface NewMemory {
  userId: string;
  slug: string;
  content: string;
  date: string;
}

export interface BaseMemory {
  id: string;
  author: {
    name: string | null;
    verified: boolean;
    id: string;
  };
  createdAt: Date;
  date: string;
  content: string;
  donationCount: number;
  totalLikes: number;
  memorialSlug: string;
  isLikedByUser?: boolean;
  status: MemorialContributionStatus;
}

interface MemoryWithAsset extends BaseMemory {
  assetPath: string;
  assetType: AssetType;
  assetDecoration: MemorialTribute | null;
}

interface MemoryWithoutAsset extends BaseMemory {
  decoration: MemorialDecoration | null;
}

export type Memory = MemoryWithAsset | MemoryWithoutAsset;

export type MemoryWithMemorialInfo = Memory & {
  memorial: PublishedMemorial;
};
