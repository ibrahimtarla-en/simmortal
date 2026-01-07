import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoryEntity } from 'src/entities/MemoryEntity';
import { Repository } from 'typeorm';
import {
  MemorialContributionStatus,
  MemorialContributionSortField,
  MemorialContributionSortMap,
  MemorialFlagType,
  MemorialStatus,
} from '../interface/memorial.interface';
import { createTypedCursor, encodeCursor, parseCursor } from 'src/util/pagination';
import { PaginatedResult } from 'src/types/pagination';
import { createMemoryCheckoutBasket, mapMemoryEntityToMemory } from './memory.util';
import { Memory, MemoryWithMemorialInfo, NewMemory } from './interface/memory.interface';
import { generateVersionedFilePath, getAssetTypeFromMimeType } from 'src/util/asset';
import { StorageService } from 'src/storage/storage.service';
import { MemorialService } from '../memorial.service';
import { AssetType } from 'src/types/asset';
import { ShopService } from 'src/shop/shop.service';
import { MemoryLikeEntity } from 'src/entities/MemoryLikeEntity';
import {
  PublishMemorialContributionStatus,
  PublishMemorialContributionResponse,
  ValidatePurchaseResultResponse,
} from '../interface/memorial.dto';
import { UpdateMemoryPayload } from './interface/memory.dto';
import { toBoolean } from 'src/util/transformer';
import { mapMemorialEntityToPublishedMemorial } from '../memorial.util';

@Injectable()
export class MemoryService {
  private readonly PAGE_SIZE = 20;
  private readonly logger: Logger = new Logger(MemoryService.name);
  constructor(
    @Inject(forwardRef(() => ShopService))
    private readonly shopService: ShopService,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => MemorialService))
    private readonly memorialService: MemorialService,
    @InjectRepository(MemoryEntity)
    private readonly memoryRepository: Repository<MemoryEntity>,
    @InjectRepository(MemoryLikeEntity)
    private readonly memoryLikeRepository: Repository<MemoryLikeEntity>,
  ) {}

  async getMemories(
    {
      slug,
      sort,
      cursor,
      order = 'DESC',
    }: {
      slug: string;
      sort: MemorialContributionSortField;
      cursor?: string;
      order?: 'ASC' | 'DESC';
    },
    userId?: string,
  ): Promise<PaginatedResult<Memory>> {
    const orderSign = order === 'ASC' ? '>' : '<';

    const qb = this.memoryRepository
      .createQueryBuilder('memory')
      .leftJoin('memory.likes', 'all_likes')
      .leftJoinAndSelect('memory.likes', 'user_like', 'user_like.userId = :userId', { userId })
      .leftJoinAndSelect('memory.owner', 'owner')
      .leftJoinAndSelect('memory.memorial', 'memorial')
      // Count all likes
      .addSelect('COUNT(all_likes.userId)', 'totalLikes')
      .where([
        { memorial: { premiumSlug: slug, status: MemorialStatus.PUBLISHED } },
        { memorial: { defaultSlug: slug, status: MemorialStatus.PUBLISHED } },
      ])
      .andWhere('memory.status = :status', { status: MemorialContributionStatus.PUBLISHED })
      .groupBy('memory.id')
      .addGroupBy('owner.userId') // Must add all selected relation columns
      .addGroupBy('memorial.id')
      .addGroupBy('user_like.userId')
      .addGroupBy('user_like.memoryId');

    // Apply Pagination if required
    if (cursor) {
      const config = parseCursor<MemoryEntity>(cursor);
      if (!config) {
        throw new HttpException('Invalid cursor', HttpStatus.BAD_REQUEST);
      }
      if (sort === MemorialContributionSortField.DATE) {
        qb.andWhere(
          `(memory.createdAt ${orderSign} :curCreatedAt OR (memory.createdAt = :curCreatedAt AND memory.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      } else if (sort === MemorialContributionSortField.LIKES) {
        qb.having(
          `(COUNT(all_likes.userId) ${orderSign} :curCreatedAt OR (COUNT(all_likes.userId) = :curCreatedAt AND memory.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      }
    }

    // Apply Sorting
    if (sort === MemorialContributionSortField.LIKES) {
      qb.addSelect(
        (qb) => qb.select('COUNT(*)').from(MemoryLikeEntity, 'ml').where('ml.memoryId = memory.id'),
        'order_totallikes',
      ).orderBy('order_totallikes', order);
    } else if (sort === MemorialContributionSortField.DATE) {
      qb.orderBy('memory.createdAt', order);
    }
    // Perform Query
    qb.addOrderBy('memory.id', order).take(this.PAGE_SIZE + 1);
    const items = await qb.getMany();

    const mappedItems = items.map((memory) => ({
      ...mapMemoryEntityToMemory(memory),
      isLikedByUser: userId ? memory.likes.length > 0 : undefined,
    }));
    // If total items are less than page size, there's no next page
    if (mappedItems.length <= this.PAGE_SIZE) {
      return { items: mappedItems };
    }
    const newCursor = createTypedCursor<MemoryEntity>(
      items[items.length - 1],
      MemorialContributionSortMap[sort],
    );
    return {
      items: mappedItems.slice(0, this.PAGE_SIZE),
      cursor: encodeCursor(newCursor),
    };
  }

  async createMemory(memory: NewMemory, asset?: Express.Multer.File): Promise<Memory> {
    const memorialId = await this.memorialService.getMemorialIdBySlug(memory.slug);
    if (!memorialId) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }

    const newEntry = this.memoryRepository.create({
      ownerId: memory.userId,
      memorialId: memorialId,
      content: memory.content,
      date: new Date(memory.date).toISOString(),
    });
    const savedMemory = await this.memoryRepository.save(newEntry);
    if (asset) {
      const filePath = generateVersionedFilePath(
        `memorial/${memorialId}/memories/${savedMemory.id}.${asset.originalname.split('.').pop()}`,
      );
      const assetType = getAssetTypeFromMimeType(asset.mimetype);
      if (assetType !== AssetType.IMAGE && assetType !== AssetType.VIDEO) {
        throw new HttpException('Invalid asset type', HttpStatus.BAD_REQUEST);
      }
      await this.storageService.save(filePath, asset.buffer);
      await this.memoryRepository.update(savedMemory.id, {
        assetPath: filePath,
        assetType,
      });
      savedMemory.assetPath = filePath;
      savedMemory.assetType = assetType;
    }
    const fullMemory = await this.memoryRepository.findOne({
      where: { id: savedMemory.id },
      relations: ['owner', 'memorial'],
    });
    if (!fullMemory) {
      throw new HttpException('Memory not found after creation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return mapMemoryEntityToMemory(fullMemory);
  }

  async updateMemory(
    userId: string,
    memoryId: string,
    payload: Partial<UpdateMemoryPayload>,
    asset?: Express.Multer.File,
  ): Promise<void> {
    const memory = await this.memoryRepository.findOne({
      where: { id: memoryId, ownerId: userId },
      relations: ['memorial'],
    });
    if (!memory) {
      throw new HttpException('Memory not found', HttpStatus.NOT_FOUND);
    }
    if (memory.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    let assetPath = memory.assetPath;
    let assetType = memory.assetType;
    if (toBoolean(payload.deleteAsset) === true) {
      assetPath = null;
      assetType = null;
      if (memory.assetPath) {
        await this.storageService.delete(memory.assetPath);
      }
    }
    if (asset) {
      assetPath = generateVersionedFilePath(
        `memorial/${memory.memorialId}/memories/${memory.id}.${asset.originalname.split('.').pop()}`,
      );
      assetType = getAssetTypeFromMimeType(asset.mimetype);
      if (assetType !== AssetType.IMAGE && assetType !== AssetType.VIDEO) {
        throw new HttpException('Invalid asset type', HttpStatus.BAD_REQUEST);
      }
      await this.storageService.save(assetPath, asset.buffer);
      if (memory.assetPath) {
        await this.storageService.delete(memory.assetPath);
      }
    }

    const updatePayload = { ...payload };
    delete updatePayload.deleteAsset;

    await this.memoryRepository.update(memory.id, {
      ...updatePayload,
      date: new Date(updatePayload.date || memory.date).toISOString(),
      assetPath,
      assetType,
    });
  }

  async deleteMemory(userId: string, memoryId: string): Promise<void> {
    this.logger.log(`Deleting memory ${memoryId} for user ${userId}`);
    const memory = await this.memoryRepository.findOne({
      where: { id: memoryId, ownerId: userId },
      relations: ['memorial'],
    });
    if (!memory) {
      throw new HttpException('Memory not found', HttpStatus.NOT_FOUND);
    }
    if (memory.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (memory.assetPath) {
      await this.storageService.delete(memory.assetPath);
    }
    await this.memoryRepository.delete(memory.id);
    void this.memorialService.createOrUpdateMemorialTimeline(memory.memorialId);
    this.logger.log(`Deleted memory ${memoryId} for user ${userId}`);
  }

  async getMemoryPreview(
    userId: string,
    memoryId: string,
    overrides: Partial<Memory>,
  ): Promise<Memory> {
    const memory = await this.memoryRepository.findOne({
      where: { id: memoryId },
      relations: ['owner', 'memorial'],
    });
    if (!memory) {
      throw new HttpException('Memory not found', HttpStatus.NOT_FOUND);
    }
    // Only owner of memory or memorial can preview
    if (memory.ownerId !== userId && memory.memorial.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return mapMemoryEntityToMemory({ ...memory, ...overrides });
  }

  async sendMemoryToReview(
    userId: string,
    memoryId: string,
  ): Promise<PublishMemorialContributionResponse> {
    const memory = await this.memoryRepository.findOne({
      where: { id: memoryId, ownerId: userId },
      relations: ['memorial'],
    });
    if (!memory) {
      throw new HttpException('Memory not found', HttpStatus.NOT_FOUND);
    }
    if (memory.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (memory.status === MemorialContributionStatus.PUBLISHED) {
      throw new HttpException('Memory already published', HttpStatus.BAD_REQUEST);
    }
    if (memory.status === MemorialContributionStatus.IN_REVIEW) {
      throw new HttpException('Memory is under review', HttpStatus.BAD_REQUEST);
    }
    const [decorationPrices, tributePrices] = await Promise.all([
      this.shopService.getAllDecorationPricesInCents(),
      this.shopService.getAllTributePricesInCents(),
    ]);
    const lineItems = createMemoryCheckoutBasket(memory, decorationPrices, tributePrices);
    if (lineItems.length === 0) {
      const memory = await this.memoryRepository.findOne({
        where: { id: memoryId },
        relations: ['memorial'],
      });
      if (!memory) {
        throw new HttpException('Memory not found', HttpStatus.NOT_FOUND);
      }
      memory.status = MemorialContributionStatus.PUBLISHED;
      await this.memoryRepository.save(memory);
      await this.memorialService.createOrUpdateMemorialTimeline(memory.memorialId);
      await this.memorialService.createMemorialFlag(
        memory.ownerId,
        MemorialFlagType.MEMORY_REQUEST,
        memory.id,
      );
      return { status: PublishMemorialContributionStatus.PUBLISHED };
    } else {
      const checkoutSession = await this.shopService.createMemorialContributionCheckoutSession(
        {
          memorialId: memory.memorialId,
          userId,
          memorialSlug: memory.memorial.premiumSlug || memory.memorial.defaultSlug,
          id: memory.id,
          type: 'memory',
        },
        lineItems,
      );
      if (!checkoutSession.url || !checkoutSession.id) {
        this.logger.error(
          `Failed to create checkout session for memory ${memory.id} and user ${userId}`,
        );
        throw new HttpException(
          'Failed to create checkout session',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.memoryRepository.update(memory.id, { checkoutSessionId: checkoutSession.id });
      return {
        status: PublishMemorialContributionStatus.NEEDS_PAYMENT,
        paymentUrl: checkoutSession.url,
      };
    }
  }

  async validateMemoryContributionPayment(
    slug: string,
    memoryId: string,
    sessionId: string,
  ): Promise<ValidatePurchaseResultResponse> {
    const { valid } = await this.shopService.validateMemorialContributionPurchase(sessionId);
    if (!valid) {
      return {
        success: false,
        redirectUrl: `/memorial/${slug}?session_id=${sessionId}&type=memory`,
      };
    }

    const memory = await this.memoryRepository.findOne({
      where: { id: memoryId },
      relations: ['memorial'],
    });
    if (!memory) {
      throw new HttpException('Memory not found', HttpStatus.NOT_FOUND);
    }
    memory.status = MemorialContributionStatus.PUBLISHED;
    await this.memoryRepository.save(memory);
    await this.memorialService.createOrUpdateMemorialTimeline(memory.memorialId);

    await this.memorialService.createMemorialFlag(
      memory.ownerId,
      MemorialFlagType.MEMORY_REQUEST,
      memory.id,
    );
    return {
      success: true,
      redirectUrl: `/memorial/${slug}?session_id=${sessionId}&type=memory&active_tab=memories`,
    };
  }

  async handleWebhookMemoryPaymentSucceeded(userId: string, memoryId: string): Promise<void> {
    await this.memoryRepository.update(
      { id: memoryId, ownerId: userId },
      { status: MemorialContributionStatus.PUBLISHED, checkoutSessionId: null },
    );
    const memory = await this.memoryRepository.findOne({ where: { id: memoryId } });
    if (memory) {
      await this.memorialService.createMemorialFlag(
        memory.ownerId,
        MemorialFlagType.MEMORY_REQUEST,
        memory.id,
      );
    }
  }

  async likeMemory(userId: string, memoryId: string): Promise<void> {
    await this.memoryLikeRepository.upsert({ userId, memoryId }, ['userId', 'memoryId']);
  }
  async unlikeMemory(userId: string, memoryId: string): Promise<void> {
    await this.memoryLikeRepository.delete({ userId, memoryId });
  }

  async getMemoryEntityById(memoryId: string): Promise<MemoryEntity | null> {
    return this.memoryRepository.findOne({
      where: { id: memoryId },
      relations: ['memorial'],
    });
  }

  async getMemoryById(memoryId: string): Promise<Memory | null> {
    const memory = await this.memoryRepository.findOne({
      where: { id: memoryId },
      relations: ['owner', 'memorial', 'likes'],
    });
    if (!memory) {
      return null;
    }
    return mapMemoryEntityToMemory(memory);
  }

  async updateMemoryStatus(memoryId: string, status: MemorialContributionStatus): Promise<void> {
    const memory = await this.memoryRepository.findOne({
      where: { id: memoryId },
      relations: ['memorial'],
    });
    if (!memory) {
      throw new HttpException('Memory not found', HttpStatus.NOT_FOUND);
    }
    memory.status = status;
    await this.memoryRepository.save(memory);
    if (
      status === MemorialContributionStatus.PUBLISHED ||
      status === MemorialContributionStatus.REMOVED
    ) {
      void this.memorialService.createOrUpdateMemorialTimeline(memory.memorialId);
    }
  }

  async getLikedMemories(
    {
      sort = MemorialContributionSortField.DATE,
      cursor,
      order = 'DESC',
    }: {
      sort?: MemorialContributionSortField;
      cursor?: string;
      order?: 'ASC' | 'DESC';
    },
    userId?: string,
  ): Promise<PaginatedResult<MemoryWithMemorialInfo>> {
    const orderSign = order === 'ASC' ? '>' : '<';

    const qb = this.memoryRepository
      .createQueryBuilder('memory')
      .leftJoin('memory.likes', 'all_likes')
      .leftJoinAndSelect('memory.likes', 'user_like', 'user_like.userId = :userId', { userId })
      .leftJoinAndSelect('memory.owner', 'owner')
      .leftJoinAndSelect('memory.memorial', 'memorial')
      // Count all likes
      .addSelect('COUNT(all_likes.userId)', 'totalLikes')
      .where({ memorial: { status: MemorialStatus.PUBLISHED } })
      .andWhere('user_like.userId = :userId', { userId })
      .andWhere('memory.status = :status', { status: MemorialContributionStatus.PUBLISHED })
      .groupBy('memory.id')
      .addGroupBy('owner.userId') // Must add all selected relation columns
      .addGroupBy('memorial.id')
      .addGroupBy('user_like.userId')
      .addGroupBy('user_like.memoryId');

    // Apply Pagination if required
    if (cursor) {
      const config = parseCursor<MemoryEntity>(cursor);
      if (!config) {
        throw new HttpException('Invalid cursor', HttpStatus.BAD_REQUEST);
      }
      if (sort === MemorialContributionSortField.DATE) {
        qb.andWhere(
          `(memory.createdAt ${orderSign} :curCreatedAt OR (memory.createdAt = :curCreatedAt AND memory.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      } else if (sort === MemorialContributionSortField.LIKES) {
        qb.having(
          `(COUNT(all_likes.userId) ${orderSign} :curCreatedAt OR (COUNT(all_likes.userId) = :curCreatedAt AND memory.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      }
    }

    // Apply Sorting
    if (sort === MemorialContributionSortField.LIKES) {
      qb.addSelect(
        (qb) => qb.select('COUNT(*)').from(MemoryLikeEntity, 'ml').where('ml.memoryId = memory.id'),
        'order_totallikes',
      ).orderBy('order_totallikes', order);
    } else if (sort === MemorialContributionSortField.DATE) {
      qb.orderBy('memory.createdAt', order);
    }
    // Perform Query
    qb.addOrderBy('memory.id', order).take(this.PAGE_SIZE + 1);
    const items = await qb.getMany();

    const mappedItems = items.map((memory) => ({
      ...mapMemoryEntityToMemory(memory),
      memorial: mapMemorialEntityToPublishedMemorial(memory.memorial),
      isLikedByUser: userId ? memory.likes.length > 0 : undefined,
    }));
    // If total items are less than page size, there's no next page
    if (mappedItems.length <= this.PAGE_SIZE) {
      return { items: mappedItems };
    }
    const newCursor = createTypedCursor<MemoryEntity>(
      items[items.length - 1],
      MemorialContributionSortMap[sort],
    );
    return {
      items: mappedItems.slice(0, this.PAGE_SIZE),
      cursor: encodeCursor(newCursor),
    };
  }

  async getOwnedMemories(
    {
      sort = MemorialContributionSortField.DATE,
      cursor,
      order = 'DESC',
    }: {
      sort?: MemorialContributionSortField;
      cursor?: string;
      order?: 'ASC' | 'DESC';
    },
    userId?: string,
  ): Promise<PaginatedResult<MemoryWithMemorialInfo>> {
    const orderSign = order === 'ASC' ? '>' : '<';

    const qb = this.memoryRepository
      .createQueryBuilder('memory')
      .leftJoin('memory.likes', 'all_likes')
      .leftJoinAndSelect('memory.likes', 'user_like', 'user_like.userId = :userId', { userId })
      .leftJoinAndSelect('memory.owner', 'owner')
      .leftJoinAndSelect('memory.memorial', 'memorial')
      // Count all likes
      .addSelect('COUNT(all_likes.userId)', 'totalLikes')
      .where({ ownerId: userId, memorial: { status: MemorialStatus.PUBLISHED } })
      .andWhere('memory.status = :status', { status: MemorialContributionStatus.PUBLISHED })
      .groupBy('memory.id')
      .addGroupBy('owner.userId') // Must add all selected relation columns
      .addGroupBy('memorial.id')
      .addGroupBy('user_like.userId')
      .addGroupBy('user_like.memoryId');

    // Apply Pagination if required
    if (cursor) {
      const config = parseCursor<MemoryEntity>(cursor);
      if (!config) {
        throw new HttpException('Invalid cursor', HttpStatus.BAD_REQUEST);
      }
      if (sort === MemorialContributionSortField.DATE) {
        qb.andWhere(
          `(memory.createdAt ${orderSign} :curCreatedAt OR (memory.createdAt = :curCreatedAt AND memory.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      } else if (sort === MemorialContributionSortField.LIKES) {
        qb.having(
          `(COUNT(all_likes.userId) ${orderSign} :curCreatedAt OR (COUNT(all_likes.userId) = :curCreatedAt AND memory.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      }
    }

    // Apply Sorting
    if (sort === MemorialContributionSortField.LIKES) {
      qb.addSelect(
        (qb) => qb.select('COUNT(*)').from(MemoryLikeEntity, 'ml').where('ml.memoryId = memory.id'),
        'order_totallikes',
      ).orderBy('order_totallikes', order);
    } else if (sort === MemorialContributionSortField.DATE) {
      qb.orderBy('memory.createdAt', order);
    }
    // Perform Query
    qb.addOrderBy('memory.id', order).take(this.PAGE_SIZE + 1);
    const items = await qb.getMany();

    const mappedItems = items.map((memory) => ({
      ...mapMemoryEntityToMemory(memory),
      memorial: mapMemorialEntityToPublishedMemorial(memory.memorial),
      isLikedByUser: userId ? memory.likes.length > 0 : undefined,
    }));
    // If total items are less than page size, there's no next page
    if (mappedItems.length <= this.PAGE_SIZE) {
      return { items: mappedItems };
    }
    const newCursor = createTypedCursor<MemoryEntity>(
      items[items.length - 1],
      MemorialContributionSortMap[sort],
    );
    return {
      items: mappedItems.slice(0, this.PAGE_SIZE),
      cursor: encodeCursor(newCursor),
    };
  }
}
