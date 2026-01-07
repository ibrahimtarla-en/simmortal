import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MemorialContributionStatus,
  MemorialContributionSortField,
  MemorialContributionSortMap,
  MemorialStatus,
} from '../interface/memorial.interface';
import { createTypedCursor, encodeCursor, parseCursor } from 'src/util/pagination';
import { PaginatedResult } from 'src/types/pagination';
import { MemorialService } from '../memorial.service';
import { ShopService } from 'src/shop/shop.service';
import {
  PublishMemorialContributionStatus,
  ValidatePurchaseResultResponse,
  PublishPaidMemorialContributionResponse,
} from '../interface/memorial.dto';
import { DonationEntity } from 'src/entities/DonationEntity';
import { DonationLikeEntity } from 'src/entities/DonationLikeEntity';
import {
  createDonationCheckoutBasket,
  getDonationItemCountFromWreath,
  mapDonationEntityToDonation,
} from './donation.util';
import { Donation, DonationWithMemorialInfo, NewDonation } from './interface/donation.interface';
import { mapMemorialEntityToPublishedMemorial } from '../memorial.util';

@Injectable()
export class DonationService {
  private readonly PAGE_SIZE = 20;
  private readonly logger: Logger = new Logger(DonationService.name);
  constructor(
    @Inject(forwardRef(() => ShopService))
    private readonly shopService: ShopService,
    @Inject(forwardRef(() => MemorialService))
    private readonly memorialService: MemorialService,
    @InjectRepository(DonationEntity)
    private readonly donationRepository: Repository<DonationEntity>,
    @InjectRepository(DonationLikeEntity)
    private readonly donationLikeRepository: Repository<DonationLikeEntity>,
  ) {}

  async getDonations(
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
  ): Promise<PaginatedResult<Donation>> {
    const orderSign = order === 'ASC' ? '>' : '<';

    const qb = this.donationRepository
      .createQueryBuilder('donation')
      .leftJoin('donation.likes', 'all_likes')
      .leftJoinAndSelect('donation.likes', 'user_like', 'user_like.userId = :userId', { userId })
      .leftJoinAndSelect('donation.owner', 'owner')
      .leftJoinAndSelect('donation.memorial', 'memorial')
      // Count all likes
      .addSelect('COUNT(all_likes.userId)', 'totalLikes')
      .where([
        { memorial: { premiumSlug: slug, status: MemorialStatus.PUBLISHED } },
        { memorial: { defaultSlug: slug, status: MemorialStatus.PUBLISHED } },
      ])
      .andWhere('donation.status = :status', { status: MemorialContributionStatus.PUBLISHED })
      .groupBy('donation.id')
      .addGroupBy('owner.userId') // Must add all selected relation columns
      .addGroupBy('memorial.id')
      .addGroupBy('user_like.userId')
      .addGroupBy('user_like.donationId');

    if (cursor) {
      const config = parseCursor<DonationEntity>(cursor);
      if (!config) {
        throw new HttpException('Invalid cursor', HttpStatus.BAD_REQUEST);
      }
      if (sort === MemorialContributionSortField.DATE) {
        qb.andWhere(
          `(donation.createdAt ${orderSign} :curCreatedAt OR (donation.createdAt = :curCreatedAt AND donation.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      } else if (sort === MemorialContributionSortField.LIKES) {
        qb.having(
          `(COUNT(all_likes.userId) ${orderSign} :curCreatedAt OR (COUNT(all_likes.userId) = :curCreatedAt AND donation.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      }
    }
    // Apply Sorting
    if (sort === MemorialContributionSortField.LIKES) {
      qb.addSelect(
        (qb) =>
          qb.select('COUNT(*)').from(DonationLikeEntity, 'ml').where('ml.donationId = donation.id'),
        'order_totallikes',
      ).orderBy('order_totallikes', order);
    } else if (sort === MemorialContributionSortField.DATE) {
      qb.orderBy('donation.createdAt', order);
    }
    // Perform Query
    qb.addOrderBy('donation.id', order).take(this.PAGE_SIZE + 1);
    const items = await qb.getMany();

    const mappedItems = items.map((donation) => ({
      ...mapDonationEntityToDonation(donation),
      isLikedByUser: userId ? donation.likes.length > 0 : undefined,
    }));
    // If total items are less than page size, there's no next page
    if (mappedItems.length <= this.PAGE_SIZE) {
      return { items: mappedItems };
    }
    const newCursor = createTypedCursor<DonationEntity>(
      items[items.length - 1],
      MemorialContributionSortMap[sort],
    );
    return {
      items: mappedItems.slice(0, this.PAGE_SIZE),
      cursor: encodeCursor(newCursor),
    };
  }

  async getSingleDonation(donationId: string, userId?: string): Promise<Donation> {
    const qb = this.donationRepository
      .createQueryBuilder('donation')
      .leftJoin('donation.likes', 'all_likes')
      .leftJoinAndSelect('donation.likes', 'user_like', 'user_like.userId = :userId', { userId })
      .leftJoinAndSelect('donation.owner', 'owner')
      .leftJoinAndSelect('donation.memorial', 'memorial')
      // Count all likes
      .addSelect('COUNT(all_likes.userId)', 'totalLikes')
      .andWhere('donation.id = :donationId', { donationId })
      .groupBy('donation.id')
      .addGroupBy('owner.userId')
      .addGroupBy('memorial.id')
      .addGroupBy('user_like.userId')
      .addGroupBy('user_like.donationId');
    const entity = await qb.getOne();
    if (!entity) {
      throw new HttpException('Donation not found', HttpStatus.NOT_FOUND);
    }
    return {
      ...mapDonationEntityToDonation(entity),
      isLikedByUser: userId ? entity.likes.length > 0 : undefined,
    };
  }

  async createDonation(donation: NewDonation): Promise<Donation> {
    const memorialId = await this.memorialService.getMemorialIdBySlug(donation.slug);
    if (!memorialId) {
      throw new HttpException('Memorial not found', HttpStatus.NOT_FOUND);
    }
    const wreathPrices = await this.shopService.getAllWreathPricesInCents();
    const valueInCents = wreathPrices[donation.wreath];
    if (valueInCents === undefined) {
      throw new HttpException('Invalid wreath type', HttpStatus.BAD_REQUEST);
    }
    const newEntry = this.donationRepository.create({
      ownerId: donation.userId,
      memorialId: memorialId,
      wreath: donation.wreath,
      itemCount: getDonationItemCountFromWreath(donation.wreath),
      valueInCents,
    });
    const savedDonation = await this.donationRepository.save(newEntry);

    const fullDonation = await this.donationRepository.findOne({
      where: { id: savedDonation.id },
      relations: ['owner', 'memorial'],
    });
    if (!fullDonation) {
      throw new HttpException(
        'Donation not found after creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return mapDonationEntityToDonation(fullDonation);
  }

  async deleteDonation(userId: string, donationId: string): Promise<void> {
    this.logger.log(`Deleting donation ${donationId} for user ${userId}`);
    const donation = await this.donationRepository.findOne({
      where: { id: donationId, ownerId: userId },
    });
    if (!donation) {
      throw new HttpException('Donation not found', HttpStatus.NOT_FOUND);
    }
    if (donation.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    await this.donationRepository.delete(donation.id);
    this.logger.log(`Deleted donation ${donationId} for user ${userId}`);
  }

  async publishDonation(
    userId: string,
    donationId: string,
  ): Promise<PublishPaidMemorialContributionResponse> {
    const donation = await this.donationRepository.findOne({
      where: { id: donationId, ownerId: userId },
      relations: ['memorial'],
    });
    if (!donation) {
      throw new HttpException('Donation not found', HttpStatus.NOT_FOUND);
    }
    if (donation.ownerId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (donation.status === MemorialContributionStatus.PUBLISHED) {
      throw new HttpException('Donation already published', HttpStatus.BAD_REQUEST);
    }
    if (donation.status === MemorialContributionStatus.IN_REVIEW) {
      throw new HttpException('Donation is under review', HttpStatus.BAD_REQUEST);
    }
    const donationPrices = await this.shopService.getAllWreathPricesInCents();
    const lineItems = createDonationCheckoutBasket(donation, donationPrices);

    const checkoutSession = await this.shopService.createMemorialContributionCheckoutSession(
      {
        memorialId: donation.memorialId,
        userId,
        memorialSlug: donation.memorial.premiumSlug || donation.memorial.defaultSlug,
        id: donation.id,
        type: 'donation',
      },
      lineItems,
    );
    if (!checkoutSession.url || !checkoutSession.id) {
      this.logger.error(
        `Failed to create checkout session for donation ${donation.id} and user ${userId}`,
      );
      throw new HttpException(
        'Failed to create checkout session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    await this.donationRepository.update(donation.id, {
      checkoutSessionId: checkoutSession.id,
    });

    return {
      status: PublishMemorialContributionStatus.NEEDS_PAYMENT,
      paymentUrl: checkoutSession.url,
    };
  }

  async validateDonationContributionPayment(
    slug: string,
    donationId: string,
    sessionId: string,
  ): Promise<ValidatePurchaseResultResponse> {
    const { valid } = await this.shopService.validateMemorialContributionPurchase(sessionId);
    if (!valid) {
      return {
        success: false,
        redirectUrl: `/memorial/${slug}?session_id=${sessionId}&type=donation`,
      };
    }
    const donation = await this.donationRepository.findOne({
      where: { id: donationId },
      relations: ['memorial'],
    });
    if (!donation) {
      throw new HttpException('Donation not found', HttpStatus.NOT_FOUND);
    }
    donation.status = MemorialContributionStatus.PUBLISHED;
    await this.donationRepository.save(donation);
    return {
      success: true,
      redirectUrl: `/memorial/${slug}?session_id=${sessionId}&type=donation&active_tab=donations`,
    };
  }
  async handleWebhookDonationPaymentSucceeded(userId: string, donationId: string): Promise<void> {
    await this.donationRepository.update(
      { id: donationId, ownerId: userId },
      { status: MemorialContributionStatus.PUBLISHED, checkoutSessionId: null },
    );
  }

  async likeDonation(userId: string, donationId: string): Promise<void> {
    await this.donationLikeRepository.upsert({ userId, donationId }, ['userId', 'donationId']);
  }
  async unlikeDonation(userId: string, donationId: string): Promise<void> {
    await this.donationLikeRepository.delete({ userId, donationId });
  }

  async getDonationEntityById(donationId: string): Promise<DonationEntity | null> {
    return this.donationRepository.findOne({
      where: { id: donationId },
      relations: ['memorial'],
    });
  }

  async getDonationById(donationId: string): Promise<Donation | null> {
    const donation = await this.donationRepository.findOne({
      where: { id: donationId },
      relations: ['owner', 'memorial', 'likes'],
    });
    if (!donation) {
      return null;
    }
    return mapDonationEntityToDonation(donation);
  }

  async updateDonationStatus(donationId: string, status: MemorialContributionStatus) {
    await this.donationRepository.update(donationId, { status });
  }

  async getLikedDonations(
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
  ): Promise<PaginatedResult<DonationWithMemorialInfo>> {
    const orderSign = order === 'ASC' ? '>' : '<';

    const qb = this.donationRepository
      .createQueryBuilder('donation')
      .leftJoin('donation.likes', 'all_likes')
      .leftJoinAndSelect('donation.likes', 'user_like', 'user_like.userId = :userId', { userId })
      .leftJoinAndSelect('donation.owner', 'owner')
      .leftJoinAndSelect('donation.memorial', 'memorial')
      // Count all likes
      .addSelect('COUNT(all_likes.userId)', 'totalLikes')
      .where({ memorial: { status: MemorialStatus.PUBLISHED } })
      .andWhere('user_like.userId = :userId', { userId })
      .andWhere('donation.status = :status', { status: MemorialContributionStatus.PUBLISHED })
      .groupBy('donation.id')
      .addGroupBy('owner.userId') // Must add all selected relation columns
      .addGroupBy('memorial.id')
      .addGroupBy('user_like.userId')
      .addGroupBy('user_like.donationId');

    // Apply Pagination if required
    if (cursor) {
      const config = parseCursor<DonationEntity>(cursor);
      if (!config) {
        throw new HttpException('Invalid cursor', HttpStatus.BAD_REQUEST);
      }
      if (sort === MemorialContributionSortField.DATE) {
        qb.andWhere(
          `(donation.createdAt ${orderSign} :curCreatedAt OR (donation.createdAt = :curCreatedAt AND donation.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      } else if (sort === MemorialContributionSortField.LIKES) {
        qb.having(
          `(COUNT(all_likes.userId) ${orderSign} :curCreatedAt OR (COUNT(all_likes.userId) = :curCreatedAt AND donation.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      }
    }

    // Apply Sorting
    if (sort === MemorialContributionSortField.LIKES) {
      qb.addSelect(
        (qb) =>
          qb.select('COUNT(*)').from(DonationLikeEntity, 'ml').where('ml.donationId = donation.id'),
        'order_totallikes',
      ).orderBy('order_totallikes', order);
    } else if (sort === MemorialContributionSortField.DATE) {
      qb.orderBy('donation.createdAt', order);
    }
    // Perform Query
    qb.addOrderBy('donation.id', order).take(this.PAGE_SIZE + 1);
    const items = await qb.getMany();

    const mappedItems = items.map((donation) => ({
      ...mapDonationEntityToDonation(donation),
      memorial: mapMemorialEntityToPublishedMemorial(donation.memorial),
      isLikedByUser: userId ? donation.likes.length > 0 : undefined,
    }));
    // If total items are less than page size, there's no next page
    if (mappedItems.length <= this.PAGE_SIZE) {
      return { items: mappedItems };
    }
    const newCursor = createTypedCursor<DonationEntity>(
      items[items.length - 1],
      MemorialContributionSortMap[sort],
    );
    return {
      items: mappedItems.slice(0, this.PAGE_SIZE),
      cursor: encodeCursor(newCursor),
    };
  }

  async getOwnedDonations(
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
  ): Promise<PaginatedResult<DonationWithMemorialInfo>> {
    const orderSign = order === 'ASC' ? '>' : '<';

    const qb = this.donationRepository
      .createQueryBuilder('donation')
      .leftJoin('donation.likes', 'all_likes')
      .leftJoinAndSelect('donation.likes', 'user_like', 'user_like.userId = :userId', { userId })
      .leftJoinAndSelect('donation.owner', 'owner')
      .leftJoinAndSelect('donation.memorial', 'memorial')
      // Count all likes
      .addSelect('COUNT(all_likes.userId)', 'totalLikes')
      .where({ ownerId: userId, memorial: { status: MemorialStatus.PUBLISHED } })
      .andWhere('donation.status = :status', { status: MemorialContributionStatus.PUBLISHED })
      .groupBy('donation.id')
      .addGroupBy('owner.userId') // Must add all selected relation columns
      .addGroupBy('memorial.id')
      .addGroupBy('user_like.userId')
      .addGroupBy('user_like.donationId');
    // Apply Pagination if required
    if (cursor) {
      const config = parseCursor<DonationEntity>(cursor);
      if (!config) {
        throw new HttpException('Invalid cursor', HttpStatus.BAD_REQUEST);
      }
      if (sort === MemorialContributionSortField.DATE) {
        qb.andWhere(
          `(donation.createdAt ${orderSign} :curCreatedAt OR (donation.createdAt = :curCreatedAt AND donation.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      } else if (sort === MemorialContributionSortField.LIKES) {
        qb.having(
          `(COUNT(all_likes.userId) ${orderSign} :curCreatedAt OR (COUNT(all_likes.userId) = :curCreatedAt AND donation.id ${orderSign} :curId))`,
          { curCreatedAt: config.sortValue, curId: config.id },
        );
      }
    }

    // Apply Sorting
    if (sort === MemorialContributionSortField.LIKES) {
      qb.addSelect(
        (qb) =>
          qb.select('COUNT(*)').from(DonationLikeEntity, 'ml').where('ml.donationId = donation.id'),
        'order_totallikes',
      ).orderBy('order_totallikes', order);
    } else if (sort === MemorialContributionSortField.DATE) {
      qb.orderBy('donation.createdAt', order);
    }
    // Perform Query
    qb.addOrderBy('donation.id', order).take(this.PAGE_SIZE + 1);
    const items = await qb.getMany();

    const mappedItems = items.map((donation) => ({
      ...mapDonationEntityToDonation(donation),
      memorial: mapMemorialEntityToPublishedMemorial(donation.memorial),
      isLikedByUser: userId ? donation.likes.length > 0 : undefined,
    }));
    // If total items are less than page size, there's no next page
    if (mappedItems.length <= this.PAGE_SIZE) {
      return { items: mappedItems };
    }
    const newCursor = createTypedCursor<DonationEntity>(
      items[items.length - 1],
      MemorialContributionSortMap[sort],
    );
    return {
      items: mappedItems.slice(0, this.PAGE_SIZE),
      cursor: encodeCursor(newCursor),
    };
  }
}
