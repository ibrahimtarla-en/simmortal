import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemorialEntity } from 'src/entities/MemorialEntity';
import { StorageService } from 'src/storage/storage.service';
import { In, MoreThan, Not, Repository } from 'typeorm';
import {
  AdminMemorial,
  AdminMemorialDetails,
  AdminMemorialFlag,
  Memorial,
  MemorialContributionStatus,
  MemorialFlag,
  MemorialFlagReason,
  MemorialFlagStatus,
  MemorialFlagType,
  MemorialReportFlag,
  MemorialStatus,
  OwnedMemorialPreview,
  PublishedMemorial,
  PublishMemorialPreview,
  TopContributor,
} from './interface/memorial.interface';
import { generateAssetUrl, generateVersionedFilePath } from 'src/util/asset';
import {
  freeMemorialDefaults,
  mapMemorialEntityToPublishedMemorial,
  mapMemorialFlagEntityToMemorialFlag,
} from './memorial.util';
import {
  getTopFlowerContributorsQuery,
  getTopCandleContributorsQuery,
  getTopTreePlantersQuery,
  getTopDonorsQuery,
} from './memorial.config';
import { MemorialViewLogEntity } from 'src/entities/MemorialViewLogEntity';
import { getClientIP, hashIP } from 'src/util/ip';
import { Request } from 'express';
import { ShopService } from 'src/shop/shop.service';
import { MemorialLikeEntity } from 'src/entities/MemorialLikeEntity';
import { FeaturedMemorialEntity } from 'src/entities/FeaturedMemorialEntity';
import {
  CreateMemorialRequest,
  CreateMemorialResponse,
  PublishFreeMemorialResponse,
  ValidatePurchaseResultResponse,
} from './interface/memorial.dto';
import { NotificationService } from 'src/notification/notification.service';
import { AIService } from 'src/ai/ai.service';
import { MemorialTimelineEntity } from 'src/entities/MemorialTimelineEntity';
import { MemorialFlagEntity } from 'src/entities/MemorialFlagEntity';
import { MemoryService } from './memory/memory.service';
import { CondolenceService } from './condolence/condolence.service';
import { MemorialSubscriptionEntity } from 'src/entities/MemorialSubscriptionEntity';
import { UserService } from 'src/user/user.service';
import { SimmTagService } from './simmtag/simmtag.service';
import { BANNED_SLUGS } from './memorial.config';
import slugify from 'slugify';
import { DonationService } from './donation/donation.service';

@Injectable()
export class MemorialService {
  private readonly MEMORIAL_VIEW_COUNT_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private readonly logger: Logger = new Logger(MemorialService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly notificationService: NotificationService,
    private readonly aiService: AIService,
    private readonly memoryService: MemoryService,
    private readonly condolenceService: CondolenceService,
    private readonly donationService: DonationService,
    private readonly simmTagService: SimmTagService,
    @Inject(forwardRef(() => ShopService))
    private readonly shopService: ShopService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectRepository(MemorialEntity)
    private readonly memorialRepository: Repository<MemorialEntity>,
    @InjectRepository(MemorialViewLogEntity)
    private readonly memorialViewLogRepository: Repository<MemorialViewLogEntity>,
    @InjectRepository(MemorialLikeEntity)
    private readonly memorialLikeRepository: Repository<MemorialLikeEntity>,
    @InjectRepository(FeaturedMemorialEntity)
    private readonly featuredMemorialRepository: Repository<FeaturedMemorialEntity>,
    @InjectRepository(MemorialTimelineEntity)
    private readonly memorialTimelineRepository: Repository<MemorialTimelineEntity>,
    @InjectRepository(MemorialFlagEntity)
    private readonly memorialFlagRepository: Repository<MemorialFlagEntity>,
    @InjectRepository(MemorialSubscriptionEntity)
    private readonly memorialSubscriptionRepository: Repository<MemorialSubscriptionEntity>,
  ) {}

  async createMemorial(
    userId: string,
    request: CreateMemorialRequest,
    image: Express.Multer.File,
  ): Promise<CreateMemorialResponse> {
    // Create memorial
    const newMemorial = this.memorialRepository.create({
      ...request,
      ownerId: userId,
    });
    const savedMemorial = await this.memorialRepository.save(newMemorial);
    // Upload image
    const filePath = generateVersionedFilePath(
      `memorial/${savedMemorial.id}/cover.${image.mimetype.split('/').pop() || 'png'}`,
    );
    await this.storageService.save(filePath, image.buffer);
    // Update image path
    savedMemorial.imagePath = filePath;
    await this.memorialRepository.save(savedMemorial);
    return { id: savedMemorial.id };
  }

  async getSlugRecommendation(
    name: string,
    memorialId: string,
    defaultSlug: string,
  ): Promise<string> {
    const idealSlug = slugify(name, { lower: true, strict: true });
    const isAvailable = await this.checkSlugAvailability(idealSlug, memorialId);
    return isAvailable ? idealSlug : `${idealSlug}-${defaultSlug}`;
  }

  async getMemorial(
    userId: string,
    memorialId: string,
    recommendSlug?: boolean,
  ): Promise<Memorial> {
    const memorial = await this.memorialRepository.findOne({
      where: {
        id: memorialId,
      },
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    if (memorial.ownerId !== userId || memorial.status === MemorialStatus.REMOVED) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    let recommendedSlug: string | undefined = undefined;
    if (recommendSlug && memorial.name) {
      recommendedSlug = await this.getSlugRecommendation(
        memorial.name,
        memorial.id,
        memorial.defaultSlug,
      );
    }
    return {
      ...memorial,
      imagePath: memorial.imagePath && generateAssetUrl(memorial.imagePath),
      coverImagePath: memorial.coverImagePath && generateAssetUrl(memorial.coverImagePath),
      livePortraitPath: memorial.livePortraitPath && generateAssetUrl(memorial.livePortraitPath),
      recommendedSlug,
    };
  }

  async updateMemorial(
    userId: string,
    memorialId: string,
    payload: Partial<Memorial>,
    { image, coverImage }: { image?: Express.Multer.File; coverImage?: Express.Multer.File },
  ): Promise<void> {
    const memorial = await this.memorialRepository.findOne({ where: { id: memorialId } });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    if (memorial.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    let imagePath = memorial.imagePath;
    if (image) {
      imagePath = generateVersionedFilePath(
        `memorial/${memorialId}/portrait.${image.mimetype.split('/').pop() || 'png'}`,
      );
      await this.storageService.save(imagePath, image.buffer);
      if (memorial.imagePath) {
        // Delete old image and live portrait folder
        await Promise.all([
          this.storageService.delete(memorial.imagePath),
          this.storageService.deleteFolder(`memorial/${memorialId}/live-portrait`),
        ]);
      }
    }
    let coverImagePath = memorial.coverImagePath;
    if (coverImage) {
      coverImagePath = generateVersionedFilePath(
        `memorial/${memorialId}/cover.${coverImage.mimetype.split('/').pop() || 'png'}`,
      );
      await this.storageService.save(coverImagePath, coverImage.buffer);
      if (memorial.coverImagePath) {
        await this.storageService.delete(memorial.coverImagePath);
      }
    }
    // Update memorial, reset live portrait if image changed
    await this.memorialRepository.update(memorialId, {
      ...payload,
      imagePath,
      coverImagePath,
      livePortraitPath: image ? null : memorial.livePortraitPath,
    });

    if (image || payload.livePortraitEffect !== undefined) {
      void this.generateLivePortrait(memorialId);
    }
  }

  async checkSlugAvailability(slug: string, memorialId: string): Promise<boolean> {
    if (BANNED_SLUGS.includes(slug.toLowerCase())) {
      this.logger.log(`Slug "${slug}" is in the list of banned slugs.`);
      return false;
    }
    const existing = await this.memorialRepository.findOne({
      where: [
        { premiumSlug: slug, id: Not(memorialId) },
        { defaultSlug: slug, id: Not(memorialId) },
      ],
    });
    return !existing;
  }

  async getMemorialIdBySlug(slug: string): Promise<string | null> {
    const memorial = await this.memorialRepository.findOne({
      where: [{ premiumSlug: slug }, { defaultSlug: slug }],
    });
    return memorial ? memorial.id : null;
  }

  async getPublishedMemorial(slug: string, userId?: string): Promise<PublishedMemorial> {
    const memorial = await this.memorialRepository
      .createQueryBuilder('memorial')
      // select only the likes by this user (if any)
      .leftJoinAndSelect('memorial.likes', 'like', 'like.userId = :userId', { userId })
      .leftJoinAndSelect('memorial.timeline', 'timeline')
      .leftJoinAndSelect('memorial.location', 'location')
      .where([{ premiumSlug: slug }, { defaultSlug: slug }])
      .andWhere('memorial.status = :status', { status: MemorialStatus.PUBLISHED })
      .getOne();
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    return mapMemorialEntityToPublishedMemorial(memorial, {
      isLikedByUser: memorial.likes.length > 0,
      freeOnly: !memorial.isPremium,
    });
  }

  async getPublishedMemorialById(id: string): Promise<PublishedMemorial> {
    const memorial = await this.memorialRepository
      .createQueryBuilder('memorial')
      .leftJoinAndSelect('memorial.timeline', 'timeline')
      .leftJoinAndSelect('memorial.location', 'location')
      .where('memorial.id = :id', { id })
      .andWhere('memorial.status = :status', { status: MemorialStatus.PUBLISHED })
      .getOne();
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    return mapMemorialEntityToPublishedMemorial(memorial, { freeOnly: !memorial.isPremium });
  }

  async likeMemorial(memorialId: string, userId: string): Promise<void> {
    const memorial = await this.memorialRepository.findOne({ where: { id: memorialId } });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    await Promise.all([
      this.memorialLikeRepository.upsert(
        {
          memorialId,
          userId,
        },
        ['memorialId', 'userId'],
      ),
      this.notificationService.createMemorialLikedNotification(memorial, userId),
    ]);
  }

  async unlikeMemorial(memorialId: string, userId: string): Promise<void> {
    await this.memorialLikeRepository.delete({
      memorialId,
      userId,
    });
  }

  async createMemorialPreview(
    memorialId: string,
    overrides: Partial<Memorial>,
    freeVersion: boolean = false,
  ): Promise<PublishedMemorial> {
    const memorial = await this.memorialRepository.findOne({
      where: { id: memorialId },
    });

    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    return mapMemorialEntityToPublishedMemorial(
      { ...memorial, ...overrides },
      {
        freeOnly: freeVersion,
        skipStatusCheck: true,
      },
    );
  }

  async getPublishMemorialPreview(memorialId: string): Promise<PublishMemorialPreview> {
    const memorial = await this.memorialRepository.findOne({
      where: { id: memorialId },
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    return {
      freeVersion: mapMemorialEntityToPublishedMemorial(memorial, {
        skipStatusCheck: true,
        freeOnly: true,
      }),
      premiumVersion: mapMemorialEntityToPublishedMemorial(memorial, {
        skipStatusCheck: true,
        freeOnly: false,
      }),
      premiumPrice: '$8.99',
    };
  }

  async incrementMemorialView(
    memorialId: string,
    req: Request,
  ): Promise<{ counted: boolean; totalViews: number }> {
    const clientIP = getClientIP(req);
    const ipHash = hashIP(clientIP);

    const cooldownStart = new Date(Date.now() - this.MEMORIAL_VIEW_COUNT_COOLDOWN);

    // Check if this IP has viewed this memorial within cooldown period
    const recentView = await this.memorialViewLogRepository.findOne({
      where: {
        memorialId,
        ipHash,
        viewedAt: MoreThan(cooldownStart),
      },
    });

    let counted = false;

    if (!recentView) {
      // Just add a log entry
      await this.memorialViewLogRepository.save({
        memorialId,
        ipHash,
        viewedAt: new Date(),
      });
      counted = true;
    }

    // Count total views by counting log entries
    const totalViews = await this.memorialViewLogRepository.count({
      where: { memorialId },
    });

    return { counted, totalViews };
  }

  async getMemorialViewCount(memorialId: string): Promise<number> {
    return this.memorialViewLogRepository.count({
      where: { memorialId },
    });
  }

  async incrementMemorialViewBySlug(slug: string, req: Request): Promise<void> {
    const memorial = await this.memorialRepository.findOne({
      where: [{ premiumSlug: slug }, { defaultSlug: slug }],
    });

    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }

    await this.incrementMemorialView(memorial.id, req);
  }

  async publishFreeMemorial(
    userId: string,
    memorialId: string,
  ): Promise<PublishFreeMemorialResponse> {
    const memorial = await this.memorialRepository.findOne({ where: { id: memorialId } });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    if (memorial.ownerId !== userId || memorial.status === MemorialStatus.REMOVED) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    await this.memorialRepository.update(memorialId, {
      status: MemorialStatus.PUBLISHED,
      ...freeMemorialDefaults,
    });
    return {
      redirectUrl: `/memorial/${memorial.defaultSlug}?session_id=free`,
    };
  }

  async createPremiumSubscriptionLink(
    userId: string,
    memorialId: string,
    period: 'month' | 'year',
  ): Promise<string> {
    const memorial = await this.memorialRepository.findOne({ where: { id: memorialId } });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    if (memorial.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    const alreadyPremium = await this.shopService.checkSubscriptionStatus(userId, memorialId);

    // If already premium, return the published link
    if (alreadyPremium) {
      const { redirectUrl } = await this.publishPremiumMemorial(memorialId, 'existing');
      return redirectUrl;
    }

    return this.shopService.createMemorialSubscriptionSession(memorial, period).then((session) => {
      const url = session.url;
      if (!url) {
        throw new HttpException(
          'Failed to create checkout session',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return url;
    });
  }

  async getPremiumSubscriptionPrices() {
    return this.shopService.getMemorialSubscriptionPrices();
  }

  async publishPremiumMemorial(memorialId: string, sessionId: string) {
    const current = await this.memorialRepository.findOne({ where: { id: memorialId } });
    if (!current) {
      this.logger.warn(
        `Tried to publish a non-existent memorial ${memorialId} with sessionId ${sessionId}`,
      );
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    if (current?.status === MemorialStatus.REMOVED) {
      this.logger.warn(
        `Tried to publish a removed memorial ${memorialId} with sessionId ${sessionId}`,
      );
      throw new HttpException('Memorial has been removed', HttpStatus.NOT_FOUND);
    }
    const finalSlug = `/memorial/${current.premiumSlug || current.defaultSlug}?session_id=${sessionId}`;
    // If already published and premium, just return the link (may have been triggered via webhook)
    if (current?.status === MemorialStatus.PUBLISHED && current.isPremium) {
      this.logger.log(
        `Tried to republish an already premium memorial ${memorialId} with sessionId ${sessionId}`,
      );
      return {
        redirectUrl: finalSlug,
      };
    }
    current.isPremium = true;
    current.status = MemorialStatus.PUBLISHED;
    await this.memorialRepository.save(current);
    void this.generateLivePortrait(memorialId);
    return {
      redirectUrl: finalSlug,
    };
  }

  async validateSubscriptionResult(
    sessionId: string,
    publishOnValidation: boolean = false,
  ): Promise<ValidatePurchaseResultResponse> {
    const sessionStatus = await this.shopService.checkSubscriptionSessionStatus(sessionId);

    const subscriptionValid =
      sessionStatus.sessionStatus === 'complete' && sessionStatus.paymentStatus === 'paid';

    const { memorialId } = sessionStatus;
    const shouldPublish = subscriptionValid && memorialId && publishOnValidation;
    if (shouldPublish) {
      await this.memorialSubscriptionRepository.upsert(
        {
          memorialId,
          subscriptionId: sessionStatus.subscriptionId,
          lastUpdated: new Date(),
        },
        ['memorialId'],
      );
      const { redirectUrl } = await this.publishPremiumMemorial(memorialId, sessionId);
      return {
        success: subscriptionValid,
        redirectUrl,
      };
    }
    return {
      success: subscriptionValid,
      redirectUrl: memorialId
        ? `/memorial/edit/${memorialId}/preview?session_id=${sessionId}`
        : '/',
    };
  }

  async searchMemorialByName(name: string, limit: number = 10): Promise<PublishedMemorial[]> {
    const memorialsWithViews = await this.memorialRepository
      .createQueryBuilder('memorial')
      .leftJoin(
        (qb) =>
          qb
            .from(MemorialViewLogEntity, 'viewLog')
            .select('memorial_id', 'memorial_id')
            .addSelect('COUNT(*)', 'view_count')
            .groupBy('memorial_id'),
        'views',
        'views.memorial_id = memorial.id',
      )
      .addSelect('COALESCE(views.view_count, 0)', 'viewCount')
      .where('unaccent(LOWER(memorial.name)) LIKE unaccent(LOWER(:name))', { name: `%${name}%` })
      .andWhere('memorial.status = :status', { status: MemorialStatus.PUBLISHED })
      .andWhere('memorial.unlisted = :unlisted', { unlisted: false })
      .orderBy('COALESCE(views.view_count, 0)', 'DESC')
      .limit(limit)
      .getMany();
    return memorialsWithViews.map((memorial) => mapMemorialEntityToPublishedMemorial(memorial));
  }

  async handleSubscriptionUpdate(subscriptionId: string): Promise<void> {
    const subscription =
      await this.shopService.checkSubscriptionStatusBySubscriptionId(subscriptionId);
    if (!subscription || !subscription.memorialId) {
      this.logger.warn(
        `No memorial found for subscription ID: ${subscriptionId}. Skipping update.`,
      );
      return;
    }
    const memorial = await this.memorialRepository.findOne({
      where: { id: subscription.memorialId },
    });
    if (!memorial) {
      this.logger.warn(
        `Memorial with ID ${subscription.memorialId} not found for subscription ID: ${subscriptionId}. Skipping update.`,
      );
      return;
    }
    await this.memorialSubscriptionRepository.upsert(
      { memorialId: subscription.memorialId, subscriptionId, lastUpdated: new Date() },
      ['memorialId'],
    );
    if (memorial?.isPremium && subscription.status !== 'active') {
      this.logger.log(`Downgrading memorial with ID ${memorial.id} to free status.`);
      // Downgrade to free if subscription is no longer active
      await this.memorialRepository.update(memorial.id, {
        isPremium: false,
        premiumSlug: null,
        // Other premium features are reset to free defaults on page requests but retained in the DB for future use
      });
      return;
    }
    this.logger.log(
      `No changes needed for memorial ID ${memorial.id} with subscription ID ${subscriptionId}.`,
    );
  }

  async getFeaturedMemorials(limit?: number): Promise<PublishedMemorial[]> {
    const results = await this.featuredMemorialRepository.find({
      relations: ['memorial'],
      take: limit,
    });
    return results
      .map((result) => result.memorial)
      .filter((memorial) => memorial.status === MemorialStatus.PUBLISHED && !memorial.unlisted)
      .map((memorial) => mapMemorialEntityToPublishedMemorial(memorial));
  }

  async getOwnedMemorialPreviews(userId: string): Promise<OwnedMemorialPreview[]> {
    const memorials = await this.memorialRepository.find({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' },
    });
    const ownedMemorials: OwnedMemorialPreview[] = [];
    for (const memorial of memorials) {
      try {
        ownedMemorials.push({
          ...mapMemorialEntityToPublishedMemorial(memorial, { skipStatusCheck: true }),
          status: memorial.status,
        });
      } catch {
        this.logger.warn(`Skipping memorial with ID ${memorial.id} due to incomplete data.`);
        continue;
      }
    }
    return ownedMemorials;
  }

  async createOrUpdateMemorialTimeline(memorialId: string): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay to ensure DB consistency
      const memorial = await this.memorialRepository
        .createQueryBuilder('memorial')
        .leftJoinAndSelect('memorial.memories', 'memory', 'memory.status = :status', {
          status: MemorialContributionStatus.PUBLISHED,
        })
        .where('memorial.id = :id', { id: memorialId })
        .getOne();

      if (!memorial) {
        this.logger.warn(`Memorial with ID ${memorialId} not found. Skipping timeline generation.`);
        return;
      }
      if (!memorial.isPremium) {
        this.logger.warn(
          `Memorial with ID ${memorialId} is not premium. Skipping timeline generation.`,
        );
        return;
      }
      const timeline = await this.aiService.generateTimeline(memorial);
      await this.memorialTimelineRepository.upsert(
        {
          memorialId,
          timeline,
        },
        ['memorialId'],
      );
      this.logger.log(`Successfully generated/updated timeline for memorial ID ${memorialId}`);
    } catch (error) {
      this.logger.error(`Failed to generate timeline for memorial ID ${memorialId}: ${error}`);
    }
  }

  async getMemorialFlags(userId: string, slug: string): Promise<MemorialFlag[]> {
    const memorial = await this.memorialRepository.findOne({
      where: [{ premiumSlug: slug }, { defaultSlug: slug }],
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    if (memorial.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    return this.memorialFlagRepository
      .find({
        where: {
          memorialId: memorial.id,
          userId,
          status: MemorialFlagStatus.OPEN,
        },
        relations: ['actor', 'user'],
      })
      .then((flags) => flags.map(mapMemorialFlagEntityToMemorialFlag));
  }

  async createMemorialFlag(
    actorId: string,
    type: MemorialFlagType,
    referenceId: string,
    reason?: MemorialFlagReason,
  ): Promise<void> {
    let memorial: MemorialEntity | undefined | null = null;
    if (type === MemorialFlagType.MEMORY_REPORT || type === MemorialFlagType.MEMORY_REQUEST) {
      memorial = await this.memoryService
        .getMemoryEntityById(referenceId)
        .then((memory) => memory?.memorial);
    } else if (
      type === MemorialFlagType.CONDOLENCE_REPORT ||
      type === MemorialFlagType.CONDOLENCE_REQUEST
    ) {
      memorial = await this.condolenceService
        .getCondolenceEntityById(referenceId)
        .then((condolence) => condolence?.memorial);
    } else if (type === MemorialFlagType.DONATION_REPORT) {
      memorial = await this.donationService
        .getDonationEntityById(referenceId)
        .then((donation) => donation?.memorial);
    } else if (type === MemorialFlagType.MEMORIAL_REPORT) {
      memorial = await this.memorialRepository.findOne({ where: { id: referenceId } });
    }
    if (!memorial) {
      throw new HttpException('Invalid reference', HttpStatus.BAD_REQUEST);
    }
    const existingFlag = await this.memorialFlagRepository.findOne({
      where: {
        memorialId: memorial.id,
        actorId,
        type,
        referenceId,
        status: MemorialFlagStatus.OPEN,
      },
    });
    if (existingFlag) {
      this.logger.warn(
        `User ${actorId} already has an open flag for memorial ${memorial.id} for ${type}. Skipping.`,
      );
      return;
    }
    if (
      memorial.ownerId === actorId &&
      [MemorialFlagType.MEMORY_REQUEST, MemorialFlagType.CONDOLENCE_REQUEST].includes(type)
    ) {
      this.logger.log(
        `Flag creation for contribution request skipped as actor is the memorial owner. Contribution ID: ${referenceId}`,
      );
      return;
    }
    const notifyOwner = type !== MemorialFlagType.MEMORIAL_REPORT;
    const newFlag = this.memorialFlagRepository.create({
      memorialId: memorial.id,
      userId: notifyOwner ? memorial.ownerId : undefined,
      actorId,
      type,
      referenceId,
      reason,
    });
    await this.memorialFlagRepository.save(newFlag);
    const flag = await this.memorialFlagRepository.findOne({
      where: { id: newFlag.id },
      relations: ['memorial', 'actor', 'user'],
    });
    if (!flag) {
      this.logger.error(`Failed to retrieve newly created flag with ID ${newFlag.id}`);
      return;
    }
    await this.notificationService.createFlagNotification(flag);
  }

  async handleMemorialUpdateFlag(
    userId: string,
    flagId: string,
    status: MemorialFlagStatus.APPROVED | MemorialFlagStatus.REJECTED,
  ): Promise<void> {
    const flag = await this.memorialFlagRepository.findOne({
      where: { id: flagId },
      relations: ['memorial', 'actor', 'user'],
    });

    if (!flag) {
      throw new HttpException('Flag not found', HttpStatus.NOT_FOUND);
    }
    if (flag.userId && flag.userId !== userId) {
      const userIsAdmin = await this.userService.isUserAdmin(userId);
      if (!userIsAdmin) {
        throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
      } else {
        this.logger.log(
          `Admin user ${userId} is handling flag ${flagId}, originally assigned to user ${flag.userId ?? 'N/A'}.`,
        );
      }
    }
    if (flag.status !== MemorialFlagStatus.OPEN) {
      throw new HttpException('Flag already handled', HttpStatus.BAD_REQUEST);
    }
    if (status !== MemorialFlagStatus.APPROVED && status !== MemorialFlagStatus.REJECTED) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }
    if (flag.type === MemorialFlagType.MEMORIAL_REPORT) {
      // ensure only an admin can handle memorial reports
      const isAdmin = await this.userService.isUserAdmin(userId);
      if (!isAdmin) {
        throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
      }
    }
    flag.status = status;
    // * Handle Memory Request Flags
    if (flag.type === MemorialFlagType.MEMORY_REQUEST) {
      await this.memoryService.updateMemoryStatus(
        flag.referenceId,
        flag.status === MemorialFlagStatus.APPROVED
          ? MemorialContributionStatus.PUBLISHED
          : MemorialContributionStatus.REJECTED,
      );
      // * Handle Condolence Request Flags
    } else if (flag.type === MemorialFlagType.CONDOLENCE_REQUEST) {
      await this.condolenceService.updateCondolenceStatus(
        flag.referenceId,
        flag.status === MemorialFlagStatus.APPROVED
          ? MemorialContributionStatus.PUBLISHED
          : MemorialContributionStatus.REJECTED,
      );
    }
    // * Handle Memory Report Flags
    else if (
      flag.type === MemorialFlagType.MEMORY_REPORT &&
      flag.status === MemorialFlagStatus.APPROVED
    ) {
      await this.memoryService.updateMemoryStatus(
        flag.referenceId,
        MemorialContributionStatus.REMOVED,
      );
    }
    // * Handle Condolence Report Flags
    else if (
      flag.type === MemorialFlagType.CONDOLENCE_REPORT &&
      flag.status === MemorialFlagStatus.APPROVED
    ) {
      await this.condolenceService.updateCondolenceStatus(
        flag.referenceId,
        MemorialContributionStatus.REMOVED,
      );
    }
    // * Handle Donation Report Flags
    else if (
      flag.type === MemorialFlagType.DONATION_REPORT &&
      flag.status === MemorialFlagStatus.APPROVED
    ) {
      await this.donationService.updateDonationStatus(
        flag.referenceId,
        MemorialContributionStatus.REMOVED,
      );
    }
    // *  Handle Memorial Report Flags
    else if (
      flag.type === MemorialFlagType.MEMORIAL_REPORT &&
      flag.status === MemorialFlagStatus.APPROVED
    ) {
      await this.memorialRepository.update(flag.memorialId, {
        status: MemorialStatus.REMOVED,
      });
      this.logger.log(`Memorial ${flag.referenceId} has been removed by ${flag.userId}`);
    }
    await this.memorialFlagRepository.save(flag);
    await this.notificationService.createFlagHandledNotification(flag);
    this.logger.log(`Flag with ID ${flag.id} has been marked as ${flag.status} by user ${userId}`);
  }

  async addFeaturedMemorial(adminId: string, memorialId: string): Promise<void> {
    await this.featuredMemorialRepository.upsert({ id: memorialId }, ['id']);
    this.logger.log(`Admin ${adminId} added featured memorial ${memorialId}`);
  }

  async removeFeaturedMemorial(adminId: string, memorialId: string): Promise<void> {
    await this.featuredMemorialRepository.delete({ id: memorialId });
    this.logger.log(`Admin ${adminId} removed featured memorial ${memorialId}`);
  }

  async getAdminMemorials(): Promise<AdminMemorial[]> {
    const [memorials, featuredMemorials] = await Promise.all([
      this.memorialRepository.find({
        order: { createdAt: 'DESC' },
      }),
      this.featuredMemorialRepository.find(),
    ]);
    const adminMemorials: AdminMemorial[] = [];
    memorials.forEach((m) => {
      try {
        adminMemorials.push({
          ...mapMemorialEntityToPublishedMemorial(m, { skipStatusCheck: true }),
          isFeatured: featuredMemorials.some((fm) => fm.id === m.id),
          isPremium: m.isPremium,
          status: m.status,
        });
      } catch {
        // skip incomplete memorials (lacking foundational information and image)
        return;
      }
    });
    return adminMemorials;
  }

  async getAdminMemorialById(memorialId: string): Promise<AdminMemorialDetails> {
    const [memorialResult, featuredMemorials] = await Promise.all([
      this.memorialRepository
        .createQueryBuilder('memorial')
        .leftJoinAndSelect('memorial.owner', 'owner')
        .addSelect(
          (qb) =>
            qb
              .select('COALESCE(SUM(t.value_in_cents), 0)')
              .from('memorial_transaction', 't')
              .where('t.memorial_id = memorial.id'),
          'totalRevenueInCents',
        )
        .addSelect(
          (qb) => qb.select('COUNT(m.id)').from('memory', 'm').where('m.memorial_id = memorial.id'),
          'totalMemories',
        )
        .addSelect(
          (qb) =>
            qb.select('COUNT(c.id)').from('condolence', 'c').where('c.memorial_id = memorial.id'),
          'totalCondolences',
        )
        .addSelect(
          (qb) =>
            qb.select('COUNT(d.id)').from('donation', 'd').where('d.memorial_id = memorial.id'),
          'totalDonations',
        )
        .where('memorial.id = :memorialId', { memorialId })
        .getRawAndEntities(),
      this.featuredMemorialRepository.find(),
    ]);

    const memorial = memorialResult.entities[0];
    const rawResult = memorialResult.raw[0] as
      | {
          totalRevenueInCents: string;
          totalMemories: string;
          totalCondolences: string;
          totalDonations: string;
        }
      | undefined;

    const totalRevenueInCents = Number(rawResult?.totalRevenueInCents || 0);
    const totalMemories = Number(rawResult?.totalMemories || 0);
    const totalCondolences = Number(rawResult?.totalCondolences || 0);
    const totalDonations = Number(rawResult?.totalDonations || 0);

    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }

    return {
      ...mapMemorialEntityToPublishedMemorial(memorial, { skipStatusCheck: true }),
      isFeatured: featuredMemorials.some((fm) => fm.id === memorial.id),
      isPremium: memorial.isPremium,
      status: memorial.status,
      totalRevenue: (totalRevenueInCents / 100).toFixed(2),
      totalMemories,
      totalCondolences,
      totalDonations,
    };
  }

  async getOpenAdminFlags(): Promise<AdminMemorialFlag[]> {
    const flags = await this.memorialFlagRepository.find({
      where: {
        status: MemorialFlagStatus.OPEN,
        type: In([
          MemorialFlagType.MEMORIAL_REPORT,
          MemorialFlagType.MEMORY_REPORT,
          MemorialFlagType.CONDOLENCE_REPORT,
          MemorialFlagType.DONATION_REPORT,
        ]),
      },
      relations: { memorial: { owner: true }, actor: true, user: true },
    });
    return flags.map((flag) => ({
      ...mapMemorialFlagEntityToMemorialFlag(flag),
      memorialUrl: `/memorial/${flag.memorial.defaultSlug}`,
      type: flag.type as MemorialReportFlag,
      memorialName: flag.memorial.name ?? '-',
      memorialOwner: {
        id: flag.memorial.ownerId,
        name: flag.memorial.owner.displayName,
      },
    }));
  }

  async deleteMemorial(userId: string, memorialId: string): Promise<void> {
    const memorial = await this.memorialRepository.findOne({
      where: { id: memorialId },
      relations: ['memories'],
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    if (memorial.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    const assetPaths: string[] = [
      ...memorial.memories
        .map((memory) => memory.assetPath)
        .filter((path): path is string => !!path),
    ];
    if (memorial.imagePath) {
      assetPaths.push(memorial.imagePath);
    }
    await this.memorialRepository.remove(memorial);
    this.logger.log(`Memorial with ID ${memorialId} has been deleted by user ${userId}`);
    await this.storageService
      .deleteFolder(`memorial/${memorialId}`)
      .then(() => {
        this.logger.log(
          `Deleted storage folder for memorial ID ${memorialId} and all its contents.`,
        );
      })
      .catch((error) => {
        this.logger.error(
          `Failed to delete storage folder for memorial ID ${memorialId}: ${error}`,
        );
      });
  }

  async generateLivePortrait(memorialId: string): Promise<void> {
    const memorial = await this.memorialRepository.findOne({
      where: { id: memorialId },
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    if (!memorial.isPremium) {
      this.logger.log(
        `Memorial ID ${memorialId} is not premium. Skipping live portrait generation.`,
      );
      return;
    }
    if (memorial.status !== MemorialStatus.PUBLISHED) {
      this.logger.log(
        `Memorial ID ${memorialId} is not published. Skipping live portrait generation.`,
      );
      return;
    }
    const portraitPath = await this.aiService.generateLivePortrait(memorial);
    if (!portraitPath) {
      return;
    }
    memorial.livePortraitPath = portraitPath;
    await this.memorialRepository.save(memorial);
    this.logger.log(`Generated live portrait for memorial ID ${memorialId}`);
  }

  async verifyMemorialOwnership(userId: string, memorialId: string): Promise<void> {
    const memorial = await this.memorialRepository.findOne({
      where: { id: memorialId },
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    if (memorial.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    return;
  }

  async getTopFlowerContributors(slug: string): Promise<TopContributor[]> {
    const memorial = await this.memorialRepository.findOne({
      where: [{ premiumSlug: slug }, { defaultSlug: slug }],
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }

    const query = getTopFlowerContributorsQuery();
    return this.memorialRepository.query<TopContributor[]>(query, [memorial.id]);
  }

  async getTopCandleContributors(slug: string): Promise<TopContributor[]> {
    const memorial = await this.memorialRepository.findOne({
      where: [{ premiumSlug: slug }, { defaultSlug: slug }],
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }

    const query = getTopCandleContributorsQuery();
    return this.memorialRepository.query<TopContributor[]>(query, [memorial.id]);
  }

  async getTopTreePlanters(slug: string): Promise<TopContributor[]> {
    const memorial = await this.memorialRepository.findOne({
      where: [{ premiumSlug: slug }, { defaultSlug: slug }],
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }

    const query = getTopTreePlantersQuery();
    return this.memorialRepository.query<TopContributor[]>(query, [memorial.id]);
  }

  async getTopDonors(slug: string): Promise<TopContributor[]> {
    const memorial = await this.memorialRepository.findOne({
      where: [{ premiumSlug: slug }, { defaultSlug: slug }],
    });
    if (!memorial) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }

    const query = getTopDonorsQuery();
    return this.memorialRepository.query<TopContributor[]>(query, [memorial.id]).then((results) => {
      return results.map((result) => ({
        ...result,
        amount: parseInt((result.amount / 100).toFixed(0)),
      }));
    });
  }
}
