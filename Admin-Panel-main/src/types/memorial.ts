export interface MemorialSummary {
  imageUrl: string;
  name: string;
  dateOfBirth: string;
  placeOfBirth: string;
  dateOfDeath: string;
  placeOfDeath: string;
  summary: string;
}

export const RELATION_TO_DECEASED = ['family', 'partner', 'colleague', 'friend', 'other'] as const;

export type RelationToDeceased = (typeof RELATION_TO_DECEASED)[number];

export const MEMORIAL_FRAMES = ['default', 'victorian-gold', 'victorian-silver'] as const;
export type MemorialFrame = (typeof MEMORIAL_FRAMES)[number];

export const MEMORIAL_TRIBUTES = [
  'default',
  'amethyst-tranquility',
  'blossom-of-grace',
  'crimson-devotion',
  'flames-of-remembrance',
  'frostlight-harmony',
  'golden-serenity',
  'lunar-serenity',
  'midnight-serenity',
  'ocean-of-light',
  'royal-sunrise',
  'midnight-elegy',
  'celestial-bloom',
] as const;
export type MemorialTribute = (typeof MEMORIAL_TRIBUTES)[number];

export const MEMORIAL_DECORATIONS = [
  'no-decoration',
  'amethera-rose',
  'amethyst-ravel',
  'aurelia-bloom',
  'azure-peonia',
  'celestia-lily',
  'circle-of-serenity',
  'coralia-hibiscus',
  'frostaria-bloom',
  'golden-reverie',
  'ivory-whisper',
  'lunaria-lily',
  'nocturne-calla',
  'rosalia-peony',
  'seraphine-calla',
  'solaria-bloom',
  'solaris-hibiscus',
  'sonata-bloom',
  'trinity-of-light',
  'veloria-lisianthus',
] as const;

export type MemorialDecoration = (typeof MEMORIAL_DECORATIONS)[number];

export const MEMORIAL_MUSIC = [
  'cello-one',
  'cello-two',
  'piano',
  'ud',
  'violin-one',
  'violin-two',
] as const;

export type MemorialMusic = (typeof MEMORIAL_MUSIC)[number];

export function isMemorialDecoration(decoration: string): decoration is MemorialDecoration {
  return (MEMORIAL_DECORATIONS as readonly string[]).includes(decoration);
}

export function isMemorialTribute(tribute: string): tribute is MemorialTribute {
  return (MEMORIAL_TRIBUTES as readonly string[]).includes(tribute);
}

export interface CreateMemorialResponse {
  id: string;
}

export interface CheckSlugAvailabilityRequest {
  slug: string;
  memorialId: string;
}

export interface CheckSlugAvailabilityResponse {
  isAvailable: boolean;
}

export interface ValidateSubscriptionResultResponse {
  success: boolean;
  redirectUrl: string;
}

export interface PublishFreeMemorialResponse {
  redirectUrl: string;
}

export interface PremiumMemorialPricesResponse {
  monthlyPrice: string;
  yearlyPrice: string;
  freePrice: string;
}

export interface PublishMemorialPreview {
  freeVersion: PublishedMemorial;
  premiumVersion: PublishedMemorial;
  premiumPrice: string;
}

export interface MemorialIdentityForm {
  name: string;
  dateOfBirth: Date;
  dateOfDeath: Date;
  placeOfBirth: string;
  placeOfDeath: string;
  originCountry: string;
  ownerRelation: RelationToDeceased;
  image: File;
}

export interface Memorial {
  id: string;
  name?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  placeOfBirth?: string;
  placeOfDeath?: string;
  originCountry?: string;
  ownerRelation?: RelationToDeceased;
  imagePath?: string;
  unlisted?: boolean;
  premiumSlug: string | null;
  defaultSlug: string;
  about?: string;
  frame: MemorialFrame;
  tribute: MemorialTribute;
  simmTagDesign: number | null;
  isPremium: boolean;
  status: MemorialStatus;
}

export interface PublishedMemorial {
  id: string;
  ownerId: string;
  name: string;
  dateOfBirth: string;
  dateOfDeath: string;
  placeOfBirth: string;
  placeOfDeath: string;
  originCountry: string;
  imagePath: string;
  livePortraitPath?: string;
  coverImagePath: string;
  about: string;
  slug: string;
  frame: MemorialFrame;
  tribute: MemorialTribute;
  music: MemorialMusic | null;
  simmTagDesign: number | null;
  stats: MemorialStats;
  isLikedByUser: boolean;
  createdAt: string;
  isUnlisted: boolean;
  timeline?: TimelineMemory[];
  location?: SimmTagLocation;
}

export interface SimmTagLocation {
  latitude: number;
  longitude: number;
}

export interface AdminMemorial extends PublishedMemorial {
  isFeatured: boolean;
  isPremium: boolean;
  status: MemorialStatus;
}

export interface AdminMemorialDetails extends AdminMemorial {
  totalRevenue: string;
  totalMemories: number;
  totalCondolences: number;
  totalDonations: number;
}

export interface OwnedMemorialPreview extends PublishedMemorial {
  status: MemorialStatus;
}

export enum MemorialStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  REMOVED = 'removed',
}
export interface OwnedMemorialPreview extends PublishedMemorial {
  status: MemorialStatus;
}

export const MEMORIAL_STAT_KEYS = [
  'memories',
  'flowers',
  'condolences',
  'candles',
  'trees',
  'donations',
  'views',
  'likes',
] as const;

export type MemorialStatKey = (typeof MEMORIAL_STAT_KEYS)[number];

export type MemorialStats = Record<MemorialStatKey, number>;

export interface TranscribeAudioResponse {
  transcription?: string;
}

export interface TimelineMemory {
  date: string;
  title: string;
  description: string;
}

export type MemorialContributionSortField = 'date' | 'totalLikes';

export enum MemorialFlagType {
  MEMORY_REPORT = 'memory-report',
  CONDOLENCE_REPORT = 'condolence-report',
  MEMORY_REQUEST = 'memory-request',
  CONDOLENCE_REQUEST = 'condolence-request',
  MEMORIAL_REPORT = 'memorial-report',
  DONATION_REPORT = 'donation-report',
}

export type MemorialReportFlag =
  | MemorialFlagType.MEMORIAL_REPORT
  | MemorialFlagType.MEMORY_REPORT
  | MemorialFlagType.CONDOLENCE_REPORT
  | MemorialFlagType.DONATION_REPORT;

export enum MemorialFlagStatus {
  OPEN = 'open',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface MemorialFlag {
  id: string;
  createdAt: string;
  statusUpdatedAt: string;
  status: MemorialFlagStatus;
  type: MemorialFlagType;
  referenceId: string;
  actor: {
    id: string;
    name: string | null;
  };
  reason?: MemorialFlagReason;
}

export interface AdminMemorialFlag extends MemorialFlag {
  type: MemorialReportFlag;
  memorialUrl: string;
  memorialName: string;
  memorialOwner: {
    id: string;
    name: string | null;
  };
}

export enum MemorialFlagReason {
  DISLIKE = 'dislike',
  BULLYING = 'bullying',
  HARMFUL = 'harmful',
  VIOLENCE = 'violence',
  PROMOTING = 'promoting',
  EXPLICIT = 'explicit',
  SCAM = 'scam',
  FALSE_INFO = 'false-info',
  COPYRIGHT = 'copyright',
  ILLEGAL = 'illegal',
}

export enum MemorialContributionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_REVIEW = 'in-review',
  REJECTED = 'rejected',
  REMOVED = 'removed',
}

export interface ContributionAuthor {
  id: string;
  name: string | null;
  verified: boolean;
  profilePictureUrl?: string | null;
}
export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video',
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

export const MEMORIAL_DONATION_WREATHS = ['silver', 'rose', 'gold', 'purple'] as const;

export type MemorialDonationWreath = (typeof MEMORIAL_DONATION_WREATHS)[number];
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
