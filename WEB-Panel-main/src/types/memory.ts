import { AssetType } from './asset';
import { ContributionAuthor, MemorialContributionStatus } from './contribution';
import { MemorialDecoration, MemorialTribute, PublishedMemorial } from './memorial';

export interface UpdateMemoryPayload {
  content: string;
  date: string;
  decoration: MemorialDecoration;
  assetDecoration: MemorialTribute;
  deleteAsset: boolean;
  donationCount: number;
  asset: File;
}

export interface MemoryAboutForm {
  date: Date;
  content: string;
  asset: File;
}

export type ContributeType = 'memory' | 'condolence' | 'donation';

export interface NewMemory {
  userId: string;
  slug: string;
  content: string;
  date: string;
}

export interface BaseMemory {
  id: string;
  author: ContributionAuthor;
  createdAt: string;
  date: string;
  content: string;
  donationCount: number;
  totalLikes: number;
  memorialSlug: string;
  isLikedByUser?: boolean;
  status: MemorialContributionStatus;
}

export interface MemoryWithAsset extends BaseMemory {
  assetPath: string;
  assetType: AssetType;
  assetDecoration: MemorialTribute | null;
}

export interface MemoryWithoutAsset extends BaseMemory {
  decoration: MemorialDecoration | null;
}

export interface MemoryWithoutAssetWithMemorialInfo extends MemoryWithoutAsset {
  memorial: PublishedMemorial;
}

export interface MemoryWithAssetWithMemorialInfo extends MemoryWithAsset {
  memorial: PublishedMemorial;
}

export type MemoryWithMemorialInfo =
  | MemoryWithAssetWithMemorialInfo
  | MemoryWithoutAssetWithMemorialInfo;

export type Memory = MemoryWithAsset | MemoryWithoutAsset;

export type MemoryVariant = Memory | MemoryWithMemorialInfo;

export function isMemoryWithMemorialInfo(
  memory: Memory | MemoryWithMemorialInfo,
): memory is MemoryWithMemorialInfo {
  return (memory as MemoryWithMemorialInfo).memorial !== undefined;
}

export function isMemoryWithAsset(memory: Memory): memory is MemoryWithAsset {
  return (
    (memory as MemoryWithAsset).assetPath !== undefined &&
    (memory as MemoryWithAsset).assetType !== undefined
  );
}

export function isMemoryWithoutAsset(memory: Memory): memory is MemoryWithoutAsset {
  return (memory as MemoryWithoutAsset).decoration !== undefined;
}
