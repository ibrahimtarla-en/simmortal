import { SimmTagLocation } from '../simmtag/interface/simmtag.interface';

export const RELATION_TO_DECEASED = ['family', 'partner', 'colleague', 'friend', 'other'] as const;

export type RelationToDeceased = (typeof RELATION_TO_DECEASED)[number];

export const MEMORIAL_FRAMES = [
  'default',
  'aurelian-sovereign',
  'baroque-argentum',
  'baroque-royale',
  'chromeline-elegance',
  'frosted-sovereign',
  'golden-heritage',
  'imperial-gilded-crest',
  'majestic-aureate',
  'silver-nocturne',
  'sovereign-silverleaf',
] as const;
export type MemorialFrame = (typeof MEMORIAL_FRAMES)[number];

export const MEMORIAL_MUSIC = [
  'cello-one',
  'cello-two',
  'piano',
  'ud',
  'violin-one',
  'violin-two',
] as const;

export type MemorialMusic = (typeof MEMORIAL_MUSIC)[number];

export enum MemorialTribute {
  DEFAULT = 'default',
  AMETHYST_TRANQUILITY = 'amethyst-tranquility',
  BLOSSOM_OF_GRACE = 'blossom-of-grace',
  CRIMSON_DEVOTION = 'crimson-devotion',
  FLAMES_OF_REMEMBRANCE = 'flames-of-remembrance',
  FROSTLIGHT_HARMONY = 'frostlight-harmony',
  GOLDEN_SERENITY = 'golden-serenity',
  LUNAR_SERENITY = 'lunar-serenity',
  MIDNIGHT_SERENITY = 'midnight-serenity',
  OCEAN_OF_LIGHT = 'ocean-of-light',
  ROYAL_SUNRISE = 'royal-sunrise',
  CELESTIAL_BLOOM = 'celestial-bloom',
  MIDNIGHT_ELEGY = 'midnight-elegy',
}

export enum MemorialLivePortraitEffect {
  EFFECT_ONE = 'effect-one',
  EFFECT_TWO = 'effect-two',
}

export enum MemorialDecoration {
  AMETHERA_ROSE = 'amethera-rose',
  AMETHYST_RAVEL = 'amethyst-ravel',
  AURELIA_BLOOM = 'aurelia-bloom',
  AZURE_PEONIA = 'azure-peonia',
  CELESTIA_LILY = 'celestia-lily',
  CIRCLE_OF_SERENITY = 'circle-of-serenity',
  CORALIA_HIBISCUS = 'coralia-hibiscus',
  FROSTARIA_BLOOM = 'frostaria-bloom',
  GOLDEN_REVERIE = 'golden-reverie',
  IVORY_WHISPER = 'ivory-whisper',
  LUNARIA_LILY = 'lunaria-lily',
  NOCTURNE_CALLA = 'nocturne-calla',
  ROSALIA_PEONY = 'rosalia-peony',
  SERAPHINE_CALLA = 'seraphine-calla',
  SOLARIA_BLOOM = 'solaria-bloom',
  SOLARIS_HIBISCUS = 'solaris-hibiscus',
  SONATA_BLOOM = 'sonata-bloom',
  TRINITY_OF_LIGHT = 'trinity-of-light',
  VELORIA_LISIANTHUS = 'veloria-lisianthus',
}

export enum MemorialDonationWreath {
  SILVER = 'silver',
  ROSE = 'rose',
  GOLD = 'gold',
  PURPLE = 'purple',
}

export enum MemorialStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  REMOVED = 'removed',
}

export enum MemorialContributionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_REVIEW = 'in-review',
  REJECTED = 'rejected',
  REMOVED = 'removed',
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
  livePortraitPath?: string | null;
  coverImagePath?: string;
  unlisted?: boolean;
  premiumSlug: string | null;
  defaultSlug: string;
  about?: string;
  frame: MemorialFrame;
  tribute: MemorialTribute;
  music: MemorialMusic | null;
  simmTagDesign: number | null;
  isPremium: boolean;
  status: MemorialStatus;
  recommendedSlug?: string;
  livePortraitEffect?: MemorialLivePortraitEffect | null;
}

export interface TimelineMemory {
  date: string;
  title: string;
  description: string;
  memoryId?: string;
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

export interface PublishMemorialPreview {
  freeVersion: PublishedMemorial;
  premiumVersion: PublishedMemorial;
  premiumPrice: string;
}

interface MemorialStats {
  views: number;
  condolences: number;
  memories: number;
  candles: number;
  donations: string;
  flowers: number;
  trees: number;
  likes: number;
}

// export type MemorialSortBy = 'date' | 'likes';

export enum MemorialContributionSortField {
  DATE = 'date',
  LIKES = 'totalLikes',
}

export const MemorialContributionSortMap: Record<
  MemorialContributionSortField,
  'createdAt' | 'totalLikes'
> = {
  [MemorialContributionSortField.DATE]: 'createdAt',
  [MemorialContributionSortField.LIKES]: 'totalLikes',
} as const;

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

export interface TopContributor {
  userId: string;
  name: string;
  amount: number;
}
