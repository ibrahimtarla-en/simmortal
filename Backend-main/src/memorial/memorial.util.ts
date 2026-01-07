import { MemorialEntity } from 'src/entities/MemorialEntity';
import { generateAssetUrl } from 'src/util/asset';
import {
  MemorialFlag,
  MemorialStatus,
  MemorialTribute,
  PublishedMemorial,
} from './interface/memorial.interface';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MemorialFlagEntity } from 'src/entities/MemorialFlagEntity';

interface MapMemoriaConfig {
  skipStatusCheck?: boolean;
  freeOnly?: boolean;
  isLikedByUser?: boolean;
}

export function mapMemorialEntityToPublishedMemorial(
  entity: MemorialEntity,
  config?: MapMemoriaConfig,
): PublishedMemorial {
  if (entity.status !== MemorialStatus.PUBLISHED && !config?.skipStatusCheck) {
    throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
  }
  if (
    !entity.name ||
    !entity.dateOfBirth ||
    !entity.dateOfDeath ||
    !entity.placeOfBirth ||
    !entity.placeOfDeath ||
    !entity.originCountry ||
    !entity.imagePath
  ) {
    throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
  }
  const activeSlug = entity.premiumSlug || entity.defaultSlug;
  return {
    id: entity.id,
    ownerId: entity.ownerId,
    name: entity.name,
    dateOfBirth: entity.dateOfBirth,
    dateOfDeath: entity.dateOfDeath,
    placeOfBirth: entity.placeOfBirth,
    placeOfDeath: entity.placeOfDeath,
    originCountry: entity.originCountry,
    imagePath: generateAssetUrl(entity.imagePath),
    coverImagePath: entity.coverImagePath
      ? generateAssetUrl(entity.coverImagePath)
      : generateAssetUrl(entity.imagePath),
    livePortraitPath:
      entity.livePortraitPath && !config?.freeOnly && entity.livePortraitEffect
        ? generateAssetUrl(entity.livePortraitPath)
        : undefined,
    about: entity.about ?? '',
    slug: config?.freeOnly ? entity.defaultSlug : activeSlug,
    frame: config?.freeOnly ? MemorialTribute.DEFAULT : entity.frame,
    tribute: config?.freeOnly ? MemorialTribute.DEFAULT : entity.tribute,
    music: config?.freeOnly ? null : entity.music,
    simmTagDesign: config?.freeOnly ? null : entity.simmTagDesign,
    isLikedByUser: config?.isLikedByUser || false,
    createdAt: entity.createdAt.toISOString(),
    isUnlisted: entity.unlisted,
    location: entity.location && {
      latitude: entity.location.latitude,
      longitude: entity.location.longitude,
    },
    stats: {
      views: entity.totalViews,
      condolences: entity.totalCondolences,
      memories: entity.totalMemories,
      candles: entity.totalCandles,
      donations: `$${(entity.totalDonationsInCents / 100).toFixed(0)}`,
      flowers: entity.totalFlowers,
      trees: entity.totalTrees,
      likes: entity.totalLikes,
    },
    timeline: entity.isPremium ? entity.timeline?.timeline : undefined,
  };
}

export const freeMemorialDefaults: Partial<MemorialEntity> = {
  frame: 'default',
  tribute: MemorialTribute.DEFAULT,
  simmTagDesign: null,
  premiumSlug: null,
  isPremium: false,
  music: null,
  livePortraitEffect: null,
};

export const mapMemorialFlagEntityToMemorialFlag = (entity: MemorialFlagEntity): MemorialFlag => {
  return {
    id: entity.id,
    createdAt: entity.createdAt.toISOString(),
    statusUpdatedAt: entity.statusUpdatedAt.toISOString(),
    status: entity.status,
    type: entity.type,
    referenceId: entity.referenceId,
    reason: entity.reason,
    actor: {
      id: entity.actor.userId,
      name: entity.actor.displayName,
    },
  };
};
