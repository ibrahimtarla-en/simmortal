import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MemorialContributionStatus,
  MemorialContributionSortField,
  MemorialContributionSortMap,
  MemorialStatus,
  MemorialFlagType,
} from '../interface/memorial.interface';
import { createTypedCursor, encodeCursor, parseCursor } from 'src/util/pagination';
import { PaginatedResult } from 'src/types/pagination';
import { createCondolenceCheckoutBasket, mapCondolenceEntityToCondolence } from './condolence.util';
import {
  Condolence,
  CondolenceWithMemorialInfo,
  NewCondolence,
} from './interface/condolence.interface';
import { MemorialService } from '../memorial.service';
import { ShopService } from 'src/shop/shop.service';
import { CondolenceEntity } from 'src/entities/CondolenceEntity';
import {
  PublishMemorialContributionStatus,
  PublishMemorialContributionResponse,
  ValidatePurchaseResultResponse,
} from '../interface/memorial.dto';
import { CondolenceLikeEntity } from 'src/entities/CondolenceLikeEntity';
import { UpdateCondolencePayload } from './interface/condolence.dto';
import { mapMemorialEntityToPublishedMemorial } from '../memorial.util';

@Injectable()
export class CondolenceService {
  private readonly PAGE_SIZE = 20;
  private readonly logger: Logger = new Logger(CondolenceService.name);
  constructor(
    @Inject(forwardRef(() => ShopService))
    private readonly shopService: ShopService,
    @Inject(forwardRef(() => MemorialService))
    private readonly memorialService: MemorialService,
    @InjectRepository(CondolenceEntity)
    private readonly condolenceRepository: Repository<CondolenceEntity>,
    @InjectRepository(CondolenceLikeEntity)
    private readonly condolenceLikeRepository: Repository<CondolenceLikeEntity>,
  ) {}

  async getCondolences(
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
  ): Promise<PaginatedResult<Condolence>> {
    const orderSign = order === 'ASC' ? '>' : '<';

    const qb = this.condolenceRepository
      .createQueryBuilder('condolence')
      .leftJoin('condolence.likes', 'all_likes')
      .leftJoinAndSelect('condolence.likes', 'user_like', 'user_like.userId = :userId', { userId })
      .leftJoinAndSelect('condolence.owner', 'owner')
      .leftJoinAndSelect('condolence.memorial', 'memorial')
      // Count all likes
      .addSelect('COUNT(all_likes.userId)', 'totalLikes')
      .where([
        { memorial: { premiumSlug: slug, status: MemorialStatus.PUBLISHED } },
        { memorial: { defaultSlug: slug, status: MemorialStatus.PUBLISHED } },
      ])
      .andWhere('condolence.status = :status', { status: MemorialContributionStatus.PUBLISHED })
      .groupBy('condolence.id')
      .addGroupBy('owner.userId') // Must add all selected relation columns
      .addGroupBy('memorial.id')
      .addGroupBy('user_like.userId')
      .addGroupBy('user_like.condolenceId');

    if (cursor) {
      const config = parseCursor<CondolenceEntity>(cursor);
      if (!config) {
        throw new HttpException('Invalid cursor', HttpStatus.BAD_REQUEST);
      }
      if (sort === MemorialContributionSortField.DATE) {
        qb.andWhere(
          `(condolence.createdAt ${orderSign} :curCreatedAt OR (condolence.createdAt = :curCreatedAt AND condolence.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      } else if (sort === MemorialContributionSortField.LIKES) {
        qb.having(
          `(COUNT(all_likes.userId) ${orderSign} :curCreatedAt OR (COUNT(all_likes.userId) = :curCreatedAt AND condolence.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      }
    }
    // Apply Sorting
    if (sort === MemorialContributionSortField.LIKES) {
      qb.addSelect(
        (qb) =>
          qb
            .select('COUNT(*)')
            .from(CondolenceLikeEntity, 'ml')
            .where('ml.condolenceId = condolence.id'),
        'order_totallikes',
      ).orderBy('order_totallikes', order);
    } else if (sort === MemorialContributionSortField.DATE) {
      qb.orderBy('condolence.createdAt', order);
    }
    // Perform Query
    qb.addOrderBy('condolence.id', order).take(this.PAGE_SIZE + 1);
    const items = await qb.getMany();

    const mappedItems = items.map((condolence) => ({
      ...mapCondolenceEntityToCondolence(condolence),
      isLikedByUser: userId ? condolence.likes.length > 0 : undefined,
    }));
    // If total items are less than page size, there's no next page
    if (mappedItems.length <= this.PAGE_SIZE) {
      return { items: mappedItems };
    }
    const newCursor = createTypedCursor<CondolenceEntity>(
      items[items.length - 1],
      MemorialContributionSortMap[sort],
    );
    return {
      items: mappedItems.slice(0, this.PAGE_SIZE),
      cursor: encodeCursor(newCursor),
    };
  }

  async createCondolence(condolence: NewCondolence): Promise<Condolence> {
    const memorialId = await this.memorialService.getMemorialIdBySlug(condolence.slug);
    if (!memorialId) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    const newEntry = this.condolenceRepository.create({
      ownerId: condolence.userId,
      memorialId: memorialId,
      content: condolence.content,
    });
    const savedCondolence = await this.condolenceRepository.save(newEntry);

    const fullCondolence = await this.condolenceRepository.findOne({
      where: { id: savedCondolence.id },
      relations: ['owner', 'memorial'],
    });
    if (!fullCondolence) {
      throw new HttpException(
        'Condolence not found after creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return mapCondolenceEntityToCondolence(fullCondolence);
  }

  async updateCondolence(
    userId: string,
    condolenceId: string,
    payload: Partial<UpdateCondolencePayload>,
  ): Promise<void> {
    const condolence = await this.condolenceRepository.findOne({
      where: { id: condolenceId, ownerId: userId },
    });
    if (!condolence) {
      throw new HttpException('Condolence not found', HttpStatus.NOT_FOUND);
    }
    if (condolence.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    await this.condolenceRepository.update(condolence.id, {
      ...payload,
    });
  }

  async deleteCondolence(userId: string, condolenceId: string): Promise<void> {
    this.logger.log(`Deleting condolence ${condolenceId} for user ${userId}`);
    const condolence = await this.condolenceRepository.findOne({
      where: { id: condolenceId, ownerId: userId },
    });
    if (!condolence) {
      throw new HttpException('Condolence not found', HttpStatus.NOT_FOUND);
    }
    if (condolence.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    await this.condolenceRepository.delete(condolence.id);
    this.logger.log(`Deleted condolence ${condolenceId} for user ${userId}`);
  }

  async getCondolencePreview(
    userId: string,
    condolenceId: string,
    overrides: Partial<Condolence>,
  ): Promise<Condolence> {
    const condolence = await this.condolenceRepository.findOne({
      where: { id: condolenceId },
      relations: ['owner', 'memorial'],
    });
    if (!condolence) {
      throw new HttpException('Condolence not found', HttpStatus.NOT_FOUND);
    }
    // Only owner of condolence or memorial can preview
    if (condolence.ownerId !== userId && condolence.memorial.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return mapCondolenceEntityToCondolence({ ...condolence, ...overrides });
  }

  async publishCondolence(
    userId: string,
    condolenceId: string,
  ): Promise<PublishMemorialContributionResponse> {
    const condolence = await this.condolenceRepository.findOne({
      where: { id: condolenceId, ownerId: userId },
      relations: ['memorial'],
    });
    if (!condolence) {
      throw new HttpException('Condolence not found', HttpStatus.NOT_FOUND);
    }
    if (condolence.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (condolence.status === MemorialContributionStatus.PUBLISHED) {
      throw new HttpException('Condolence already published', HttpStatus.BAD_REQUEST);
    }
    if (condolence.status === MemorialContributionStatus.IN_REVIEW) {
      throw new HttpException('Condolence is under review', HttpStatus.BAD_REQUEST);
    }
    const decorationPrices = await this.shopService.getAllDecorationPricesInCents();
    const lineItems = createCondolenceCheckoutBasket(condolence, decorationPrices);

    if (lineItems.length === 0) {
      await this.condolenceRepository.update(condolence.id, {
        status: MemorialContributionStatus.PUBLISHED,
      });
      await this.memorialService.createMemorialFlag(
        condolence.ownerId,
        MemorialFlagType.CONDOLENCE_REQUEST,
        condolence.id,
      );
      return { status: PublishMemorialContributionStatus.PUBLISHED };
    } else {
      const checkoutSession = await this.shopService.createMemorialContributionCheckoutSession(
        {
          memorialId: condolence.memorialId,
          userId,
          memorialSlug: condolence.memorial.premiumSlug || condolence.memorial.defaultSlug,
          id: condolence.id,
          type: 'condolence',
        },
        lineItems,
      );
      if (!checkoutSession.url || !checkoutSession.id) {
        this.logger.error(
          `Failed to create checkout session for condolence ${condolence.id} and user ${userId}`,
        );
        throw new HttpException(
          'Failed to create checkout session',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.condolenceRepository.update(condolence.id, {
        checkoutSessionId: checkoutSession.id,
      });

      return {
        status: PublishMemorialContributionStatus.NEEDS_PAYMENT,
        paymentUrl: checkoutSession.url,
      };
    }
  }

  async validateCondolenceContributionPayment(
    slug: string,
    condolenceId: string,
    sessionId: string,
  ): Promise<ValidatePurchaseResultResponse> {
    const { valid } = await this.shopService.validateMemorialContributionPurchase(sessionId);
    if (!valid) {
      return {
        success: false,
        redirectUrl: `/memorial/${slug}?session_id=${sessionId}&type=condolence`,
      };
    }
    const condolence = await this.condolenceRepository.findOne({
      where: { id: condolenceId },
      relations: ['memorial'],
    });
    if (!condolence) {
      throw new HttpException('Condolence not found', HttpStatus.NOT_FOUND);
    }
    condolence.status = MemorialContributionStatus.PUBLISHED;
    await this.condolenceRepository.save(condolence);
    await this.memorialService.createMemorialFlag(
      condolence.ownerId,
      MemorialFlagType.CONDOLENCE_REQUEST,
      condolence.id,
    );
    return {
      success: true,
      redirectUrl: `/memorial/${slug}?session_id=${sessionId}&type=condolence&active_tab=condolences`,
    };
  }
  async handleWebhookCondolencePaymentSucceeded(
    userId: string,
    condolenceId: string,
  ): Promise<void> {
    await this.condolenceRepository.update(
      { id: condolenceId, ownerId: userId },
      { status: MemorialContributionStatus.PUBLISHED, checkoutSessionId: null },
    );
  }

  async likeCondolence(userId: string, condolenceId: string): Promise<void> {
    await this.condolenceLikeRepository.upsert({ userId, condolenceId }, [
      'userId',
      'condolenceId',
    ]);
  }
  async unlikeCondolence(userId: string, condolenceId: string): Promise<void> {
    await this.condolenceLikeRepository.delete({ userId, condolenceId });
  }

  async getCondolenceEntityById(condolenceId: string): Promise<CondolenceEntity | null> {
    return this.condolenceRepository.findOne({
      where: { id: condolenceId },
      relations: ['memorial'],
    });
  }

  async getCondolenceById(condolenceId: string): Promise<Condolence | null> {
    const condolence = await this.condolenceRepository.findOne({
      where: { id: condolenceId },
      relations: ['owner', 'memorial', 'likes'],
    });
    if (!condolence) {
      return null;
    }
    return mapCondolenceEntityToCondolence(condolence);
  }

  async updateCondolenceStatus(condolenceId: string, status: MemorialContributionStatus) {
    await this.condolenceRepository.update(condolenceId, { status });
  }

  async getLikedCondolences(
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
  ): Promise<PaginatedResult<CondolenceWithMemorialInfo>> {
    const orderSign = order === 'ASC' ? '>' : '<';

    const qb = this.condolenceRepository
      .createQueryBuilder('condolence')
      .leftJoin('condolence.likes', 'all_likes')
      .leftJoinAndSelect('condolence.likes', 'user_like', 'user_like.userId = :userId', { userId })
      .leftJoinAndSelect('condolence.owner', 'owner')
      .leftJoinAndSelect('condolence.memorial', 'memorial')
      // Count all likes
      .addSelect('COUNT(all_likes.userId)', 'totalLikes')
      .where({ memorial: { status: MemorialStatus.PUBLISHED } })
      .andWhere('user_like.userId = :userId', { userId })
      .andWhere('condolence.status = :status', { status: MemorialContributionStatus.PUBLISHED })
      .groupBy('condolence.id')
      .addGroupBy('owner.userId') // Must add all selected relation columns
      .addGroupBy('memorial.id')
      .addGroupBy('user_like.userId')
      .addGroupBy('user_like.condolenceId');

    // Apply Pagination if required
    if (cursor) {
      const config = parseCursor<CondolenceEntity>(cursor);
      if (!config) {
        throw new HttpException('Invalid cursor', HttpStatus.BAD_REQUEST);
      }
      if (sort === MemorialContributionSortField.DATE) {
        qb.andWhere(
          `(condolence.createdAt ${orderSign} :curCreatedAt OR (condolence.createdAt = :curCreatedAt AND condolence.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      } else if (sort === MemorialContributionSortField.LIKES) {
        qb.having(
          `(COUNT(all_likes.userId) ${orderSign} :curCreatedAt OR (COUNT(all_likes.userId) = :curCreatedAt AND condolence.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      }
    }

    // Apply Sorting
    if (sort === MemorialContributionSortField.LIKES) {
      qb.addSelect(
        (qb) =>
          qb
            .select('COUNT(*)')
            .from(CondolenceLikeEntity, 'ml')
            .where('ml.condolenceId = condolence.id'),
        'order_totallikes',
      ).orderBy('order_totallikes', order);
    } else if (sort === MemorialContributionSortField.DATE) {
      qb.orderBy('condolence.createdAt', order);
    }
    // Perform Query
    qb.addOrderBy('condolence.id', order).take(this.PAGE_SIZE + 1);
    const items = await qb.getMany();

    const mappedItems = items.map((condolence) => ({
      ...mapCondolenceEntityToCondolence(condolence),
      memorial: mapMemorialEntityToPublishedMemorial(condolence.memorial),
      isLikedByUser: userId ? condolence.likes.length > 0 : undefined,
    }));
    // If total items are less than page size, there's no next page
    if (mappedItems.length <= this.PAGE_SIZE) {
      return { items: mappedItems };
    }
    const newCursor = createTypedCursor<CondolenceEntity>(
      items[items.length - 1],
      MemorialContributionSortMap[sort],
    );
    return {
      items: mappedItems.slice(0, this.PAGE_SIZE),
      cursor: encodeCursor(newCursor),
    };
  }

  async getOwnedCondolences(
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
  ): Promise<PaginatedResult<CondolenceWithMemorialInfo>> {
    const orderSign = order === 'ASC' ? '>' : '<';

    const qb = this.condolenceRepository
      .createQueryBuilder('condolence')
      .leftJoin('condolence.likes', 'all_likes')
      .leftJoinAndSelect('condolence.likes', 'user_like', 'user_like.userId = :userId', { userId })
      .leftJoinAndSelect('condolence.owner', 'owner')
      .leftJoinAndSelect('condolence.memorial', 'memorial')
      // Count all likes
      .addSelect('COUNT(all_likes.userId)', 'totalLikes')
      .where({ ownerId: userId, memorial: { status: MemorialStatus.PUBLISHED } })
      .andWhere('condolence.status = :status', { status: MemorialContributionStatus.PUBLISHED })
      .groupBy('condolence.id')
      .addGroupBy('owner.userId') // Must add all selected relation columns
      .addGroupBy('memorial.id')
      .addGroupBy('user_like.userId')
      .addGroupBy('user_like.condolenceId');

    // Apply Pagination if required
    if (cursor) {
      const config = parseCursor<CondolenceEntity>(cursor);
      if (!config) {
        throw new HttpException('Invalid cursor', HttpStatus.BAD_REQUEST);
      }
      if (sort === MemorialContributionSortField.DATE) {
        qb.andWhere(
          `(condolence.createdAt ${orderSign} :curCreatedAt OR (condolence.createdAt = :curCreatedAt AND condolence.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      } else if (sort === MemorialContributionSortField.LIKES) {
        qb.having(
          `(COUNT(all_likes.userId) ${orderSign} :curCreatedAt OR (COUNT(all_likes.userId) = :curCreatedAt AND condolence.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      }
    }

    // Apply Sorting
    if (sort === MemorialContributionSortField.LIKES) {
      qb.addSelect(
        (qb) =>
          qb
            .select('COUNT(*)')
            .from(CondolenceLikeEntity, 'ml')
            .where('ml.condolenceId = condolence.id'),
        'order_totallikes',
      ).orderBy('order_totallikes', order);
    } else if (sort === MemorialContributionSortField.DATE) {
      qb.orderBy('condolence.createdAt', order);
    }
    // Perform Query
    qb.addOrderBy('condolence.id', order).take(this.PAGE_SIZE + 1);
    const items = await qb.getMany();

    const mappedItems = items.map((condolence) => ({
      ...mapCondolenceEntityToCondolence(condolence),
      memorial: mapMemorialEntityToPublishedMemorial(condolence.memorial),
      isLikedByUser: userId ? condolence.likes.length > 0 : undefined,
    }));
    // If total items are less than page size, there's no next page
    if (mappedItems.length <= this.PAGE_SIZE) {
      return { items: mappedItems };
    }
    const newCursor = createTypedCursor<CondolenceEntity>(
      items[items.length - 1],
      MemorialContributionSortMap[sort],
    );
    return {
      items: mappedItems.slice(0, this.PAGE_SIZE),
      cursor: encodeCursor(newCursor),
    };
  }
}
