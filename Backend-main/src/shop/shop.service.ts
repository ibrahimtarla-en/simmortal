import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { env, getDomain } from 'src/config/env';
import Stripe from 'stripe';
import {
  DetailedOrder,
  FeaturedShopItem,
  MemorialContributionMetadata,
  Order,
  OrderStatus,
  ShopItem,
  ShopListingsResponse,
} from './interface/shop.interface';
import { MemorialService } from 'src/memorial/memorial.service';
import {
  getMetadataValueFromPaymentIntent,
  mapFeaturedShopItemEntityToFeaturedShopItem,
  mapOrderEntityToDetailedOrder,
  mapOrderEntityToOrder,
  mapShopItemEntityToShopItem,
} from './shop.util';
import { MemoryService } from 'src/memorial/memory/memory.service';
import { MEMORIAL_SUBSCRIPTIONS } from './shop.config';
import { formatPrice } from 'src/util/price';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/OrderEntity';
import { Repository } from 'typeorm';
import { CreateOrderRequest, CreateOrderResponse } from './interface/shop.dto';
import {
  MemorialDecoration,
  MemorialDonationWreath,
  MemorialStatus,
  MemorialTribute,
} from 'src/memorial/interface/memorial.interface';
import { MemorialEntity } from 'src/entities/MemorialEntity';
import { DecorationPriceEntity } from 'src/entities/DecorationPriceEntity';
import { TributePriceEntity } from 'src/entities/TributePriceEntity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { WreathPriceEntity } from 'src/entities/WreathPriceEntity';
import { CondolenceService } from 'src/memorial/condolence/condolence.service';
import { DonationService } from 'src/memorial/donation/donation.service';
import { ShopItemEntity } from 'src/entities/ShopItemEntity';
import { ShopFeaturedEntity } from 'src/entities/ShopFeaturedEntity';
import { ShopWaitlistEntity } from 'src/entities/ShopWaitlistEntity';
import { MemorialTransactionEntity } from 'src/entities/MemorialTransactionEntity';

const DEFAULT_DECORATION_PRICE = 399;
const DEFAULT_WREATH_PRICE = 10000;
const DEFAULT_TRIBUTE_PRICE = 399;

@Injectable()
export class ShopService {
  private readonly stripe: Stripe = new Stripe(env.stripe.secretKey);
  private readonly logger: Logger = new Logger(ShopService.name);

  constructor(
    @Inject(forwardRef(() => MemorialService))
    private readonly memorialService: MemorialService,
    @Inject(forwardRef(() => MemoryService))
    private readonly memoryService: MemoryService,
    @Inject(forwardRef(() => CondolenceService))
    private readonly condolenceService: CondolenceService,
    @Inject(forwardRef(() => DonationService))
    private readonly donationService: DonationService,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(DecorationPriceEntity)
    private readonly decorationPriceRepository: Repository<DecorationPriceEntity>,
    @InjectRepository(TributePriceEntity)
    private readonly tributePriceRepository: Repository<TributePriceEntity>,
    @InjectRepository(WreathPriceEntity)
    private readonly wreathPriceRepository: Repository<WreathPriceEntity>,
    @InjectRepository(ShopItemEntity)
    private readonly shopItemRepository: Repository<ShopItemEntity>,
    @InjectRepository(ShopFeaturedEntity)
    private readonly shopFeaturedRepository: Repository<ShopFeaturedEntity>,
    @InjectRepository(ShopWaitlistEntity)
    private readonly shopWaitlistRepository: Repository<ShopWaitlistEntity>,
    @InjectRepository(MemorialTransactionEntity)
    private readonly memorialTransactionRepository: Repository<MemorialTransactionEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await Promise.all([
      this.ensureAllDecorationsHavePrices(),
      this.ensureAllTributesHavePrices(),
      this.ensureAllWreathsHavePrices(),
    ]);
  }

  async createMemorialSubscriptionSession(memorial: MemorialEntity, interval: 'month' | 'year') {
    const { ownerId: userId, id: memorialId, status } = memorial;
    const stripeCustomerId = await this.getOrCreateCustomer(userId);
    const product = MEMORIAL_SUBSCRIPTIONS[interval]; // Currently only monthly is defined
    const isAlreadyPublished =
      status === MemorialStatus.PUBLISHED || status === MemorialStatus.REMOVED;
    const success_url = isAlreadyPublished
      ? `${getDomain()}/memorial/edit/${memorialId}?session_id={CHECKOUT_SESSION_ID}`
      : `${getDomain()}/memorial/premium-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = isAlreadyPublished
      ? `${getDomain()}/memorial/edit/${memorialId}`
      : `${getDomain()}/memorial/edit/${memorialId}/checkout?session_id={CHECKOUT_SESSION_ID}`;
    return this.stripe.checkout.sessions.create({
      success_url,
      cancel_url,
      mode: 'subscription',
      payment_method_types: ['card'],
      subscription_data: {
        metadata: { userId, memorialId },
        description: `Premium Subscription for ${memorial.name ?? memorialId} Memorial Page`,
      },
      customer: stripeCustomerId,
      line_items: [{ price: product, quantity: 1 }],
    });
  }

  async getMemorialSubscriptionPrices() {
    const [monthly, yearly] = await Promise.all([
      this.stripe.prices.retrieve(MEMORIAL_SUBSCRIPTIONS.month),
      this.stripe.prices.retrieve(MEMORIAL_SUBSCRIPTIONS.year),
    ]);
    return {
      monthlyPrice: formatPrice(monthly.unit_amount ?? 0, monthly.currency),
      yearlyPrice: formatPrice(yearly.unit_amount ?? 0, yearly.currency),
      freePrice: formatPrice(0, monthly.currency),
    };
  }

  async checkSubscriptionStatus(userId: string, memorialId: string) {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: await this.getOrCreateCustomer(userId),
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    return subscriptions.data.some(
      (subscription) =>
        subscription.metadata['memorialId'] === memorialId && subscription.status === 'active',
    );
  }

  async checkSubscriptionSessionStatus(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'], // Optionally expand to get full subscription details
      });

      const subscription =
        typeof session.subscription === 'object' && session.subscription !== null
          ? session.subscription
          : null;

      const memorialId = subscription?.metadata?.['memorialId'] || null;

      // Get next charge date from the latest invoice

      return {
        paymentStatus: session.payment_status, // 'paid' | 'unpaid' | 'no_payment_required'
        sessionStatus: session.status, // 'open' | 'complete' | 'expired'
        subscriptionId: subscription?.id, // Available when paid
        customerId: session.customer as string,
        subscription: subscription, // Full subscription object if expanded
        memorialId: memorialId || null,
      };
    } catch {
      return { paymentStatus: 'unknown', sessionStatus: 'unknown' };
    }
  }

  async checkSubscriptionStatusBySubscriptionId(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const memorialId =
        typeof subscription === 'object' && subscription !== null && 'metadata' in subscription
          ? subscription.metadata['memorialId'] || null
          : null;

      return {
        status: subscription.status,
        memorialId,
        customerId: subscription.customer as string,
        subscriptionId,
      };
    } catch {
      return null;
    }
  }

  async findCustomerByUserId(userId: string): Promise<Stripe.Customer | null> {
    try {
      const customers = await this.stripe.customers.search({
        query: `metadata['userId']:'${userId}'`,
      });
      return customers.data.length > 0 ? customers.data[0] : null;
    } catch {
      return null;
    }
  }

  async handleSubscriptionCreated(event: Stripe.CustomerSubscriptionCreatedEvent) {
    try {
      const subscriptionId = event.data.object.id;
      const userId = event.data.object.metadata['userId'];
      const memorialId = event.data.object.metadata['memorialId'];
      this.logger.log(
        `Subscription Created Event Received: ${subscriptionId} for User: ${userId} and Memorial: ${memorialId}`,
      );
      await this.memorialService.publishPremiumMemorial(memorialId, subscriptionId);
    } catch (error) {
      this.logger.error(`Error handling subscription created event ${event.id}`, error);
    }
  }

  async handleSubscriptionUpdated(
    event: Stripe.CustomerSubscriptionUpdatedEvent | Stripe.CustomerSubscriptionDeletedEvent,
  ) {
    try {
      this.logger.log(
        `Subscription ${event.type === 'customer.subscription.deleted' ? 'deleted' : 'updated'} event received. Event ID: ${event.id} `,
      );
      await this.memorialService.handleSubscriptionUpdate(event.data.object.id);
    } catch (error) {
      this.logger.error(`Error handling subscription updated/delete event ${event.id}`, error);
    }
  }

  // only handles subscription payments for logging purposes
  async handleInvoicePaymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent) {
    const invoice = event.data.object;
    if (invoice.billing_reason === 'subscription_cycle' && invoice.status === 'paid') {
      const subscriptionId = invoice.parent?.subscription_details?.subscription as
        | string
        | undefined;
      const memorialId = invoice.parent?.subscription_details?.metadata?.memorialId;
      const userId = invoice.parent?.subscription_details?.metadata?.userId;
      if (!subscriptionId || !memorialId || !userId) {
        this.logger.log(
          `Missing subscription details: subscriptionId=${subscriptionId ?? 'UNDEFINED'}, memorialId=${memorialId ?? 'UNDEFINED'}, userId=${userId ?? 'UNDEFINED'}`,
        );
        return;
      }

      const currentTransactionRecord = await this.memorialTransactionRepository.findOne({
        where: { paymentId: subscriptionId },
      });
      if (currentTransactionRecord) {
        currentTransactionRecord.valueInCents += invoice.amount_paid;
        await this.memorialTransactionRepository.save(currentTransactionRecord);
        this.logger.log(
          `Updated existing subscription transaction for memorial ${memorialId} and user ${userId}, new amount: ${currentTransactionRecord.valueInCents} cents`,
        );
      } else {
        await this.createMemorialTransaction(
          memorialId,
          userId,
          subscriptionId,
          invoice.amount_paid,
          'subscription',
        );
        this.logger.log(
          `Created new subscription transaction for memorial ${memorialId} and user ${userId}, amount: ${invoice.amount_paid} cents`,
        );
      }
    }
  }

  async handlePaymentIntentSucceeded(event: Stripe.PaymentIntentSucceededEvent) {
    try {
      const sessionId = event.data.object.id;
      this.logger.log(`Payment Intent Succeeded Event Received: ${sessionId}`);
      // Extract metadata
      const type = getMetadataValueFromPaymentIntent(event.data.object, 'type');
      const id = getMetadataValueFromPaymentIntent(event.data.object, 'id');
      const userId = getMetadataValueFromPaymentIntent(event.data.object, 'userId');
      const memorialId = getMetadataValueFromPaymentIntent(event.data.object, 'memorialId');
      const paymentId = event.data.object.id;
      const valueInCents = event.data.object.amount;

      if (type === 'memory' && id && userId) {
        this.logger.log(
          `Payment Intent Succeeded for Memory ${id} and User ${userId}, proceeding to publish memory.`,
        );
        await this.memoryService.handleWebhookMemoryPaymentSucceeded(userId, id);
      } else if (type === 'condolence' && id && userId) {
        this.logger.log(
          `Payment Intent Succeeded for Condolence ${id} and User ${userId}, proceeding to publish condolence.`,
        );
        await this.condolenceService.handleWebhookCondolencePaymentSucceeded(userId, id);
      } else if (type === 'donation' && id && userId) {
        this.logger.log(
          `Payment Intent Succeeded for Donation ${id} and User ${userId}, proceeding to publish donation.`,
        );
        await this.donationService.handleWebhookDonationPaymentSucceeded(userId, id);
      } else if (type === 'product' && id && userId) {
        this.logger.log(
          `Payment Intent Succeeded for Order ${id} and User ${userId}, proceeding to fulfill order.`,
        );
        await this.handleOrderPaymentSucceeded(id, paymentId);
      } else {
        this.logger.log(
          `No relevant metadata found to process payment intent ${paymentId} further.`,
        );
      }
      const shouldRecord = type && ['condolence', 'memory', 'donation'].includes(type);
      // Record transaction for memorial contributions (memory, condolence, donation)
      if (shouldRecord && memorialId && userId) {
        await this.createMemorialTransaction(memorialId, userId, paymentId, valueInCents, type);
      } else if (shouldRecord && (!memorialId || !userId)) {
        this.logger.warn(
          `Cannot record payment intent transaction: missing memorialId=${memorialId ?? 'UNDEFINED'} or userId=${userId ?? 'UNDEFINED'} for payment ${paymentId}, type=${type}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error handling payment intent succeeded event ${event.id}`, error);
    }
  }

  private async createMemorialTransaction(
    memorialId: string,
    userId: string,
    paymentId: string,
    valueInCents: number,
    type: string,
  ): Promise<void> {
    try {
      const transaction = this.memorialTransactionRepository.create({
        memorialId,
        userId,
        paymentId,
        valueInCents: valueInCents,
        type,
      });
      await this.memorialTransactionRepository.save(transaction);
      this.logger.log(
        `Memorial transaction recorded: ${type} for memorial ${memorialId}, user ${userId}, amount: ${valueInCents} cents`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to record memorial transaction for payment ${paymentId} (memorial: ${memorialId}, user: ${userId}, type: ${type}). This may be a duplicate or webhook retry.`,
        error,
      );
    }
  }

  async getOrCreateCustomer(userId: string): Promise<string> {
    // Try Stripe search
    const existingCustomer = await this.findCustomerByUserId(userId);
    if (existingCustomer) {
      return existingCustomer.id;
    }
    // Create new customer
    const customer = await this.stripe.customers.create({
      metadata: { userId },
    });

    return customer.id;
  }

  private async getShopItems(locale: string = 'en'): Promise<ShopItem[]> {
    const items = await this.shopItemRepository.find();
    return items.map((entity) => mapShopItemEntityToShopItem(entity, locale));
  }

  private async getFeaturedItems(locale: string = 'en'): Promise<FeaturedShopItem[]> {
    const items = await this.shopFeaturedRepository.find({ relations: ['item'] });
    return items.map((entity) => mapFeaturedShopItemEntityToFeaturedShopItem(entity, locale));
  }

  async getShopItemBySlug(slug: string, locale?: string, userId?: string): Promise<ShopItem> {
    const qb = this.shopItemRepository.createQueryBuilder('shop_item');
    qb.leftJoinAndSelect('shop_item.waitlist', 'shop_waitlist', 'shop_waitlist.userId = :userId', {
      userId,
    });
    qb.where('shop_item.slug = :slug', { slug });
    const entity = await qb.getOne();
    if (!entity) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }
    return mapShopItemEntityToShopItem(entity, locale);
  }

  async getShopItemById(id: string, locale?: string): Promise<ShopItem> {
    const entity = await this.shopItemRepository.findOne({ where: { id } });
    if (!entity) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }
    return mapShopItemEntityToShopItem(entity, locale);
  }

  async getShopContent(locale?: string): Promise<ShopListingsResponse> {
    const [items, featuredItems] = await Promise.all([
      this.getShopItems(locale),
      this.getFeaturedItems(locale),
    ]);

    const categories = Array.from(new Set(items.flatMap((item) => item.category)));

    return {
      items,
      featuredItems,
      categories,
    };
  }

  async createMemorialContributionCheckoutSession(
    { userId, memorialId, memorialSlug, id, type }: MemorialContributionMetadata,
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  ) {
    const stripeCustomerId = await this.getOrCreateCustomer(userId);
    return this.stripe.checkout.sessions.create({
      success_url:
        getDomain() +
        `/memorial/${memorialSlug}/premium-success?type=${type}&session_id={CHECKOUT_SESSION_ID}&contribution_id=${id}`,
      cancel_url:
        getDomain() +
        (type === 'donation'
          ? `/memorial/${memorialSlug}`
          : `/memorial/contribute/${memorialSlug}/${type}/edit/${id}/tribute`),
      mode: 'payment',
      invoice_creation: { enabled: true },
      payment_method_types: ['card'],
      payment_intent_data: {
        metadata: { userId, memorialId, memorialSlug, id, type },
      },
      customer: stripeCustomerId,
      line_items: lineItems,
    });
  }

  async validateMemorialContributionPurchase(
    sessionId: string,
  ): Promise<{ valid: boolean; memorialId?: string; memorialSlug?: string; id?: string }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });
      const memorialId = getMetadataValueFromPaymentIntent(session.payment_intent, 'memorialId');
      const memorialSlug = getMetadataValueFromPaymentIntent(
        session.payment_intent,
        'memorialSlug',
      );
      const id = getMetadataValueFromPaymentIntent(session.payment_intent, 'id');
      return { valid: session.payment_status === 'paid', memorialId, memorialSlug, id };
    } catch (error) {
      this.logger.error(`Error validating memorial contribution purchase ${sessionId}`, error);
      return { valid: false };
    }
  }

  async createOrderCheckoutSession(order: OrderEntity) {
    const item = await this.getShopItemById(order.itemId);
    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
          },
          unit_amount: item.price * 100, // Example amount in cents
        },
        quantity: order.quantity,
      },
    ];
    const stripeCustomerId = await this.getOrCreateCustomer(order.userId);
    const metadata = {
      userId: order.userId,
      id: order.id,
      type: 'product',
    };
    if (order.memorialId) {
      metadata['memorialId'] = order.memorialId;
    }
    const session = await this.stripe.checkout.sessions.create({
      success_url: getDomain() + `/shop?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url:
        getDomain() +
        `/shop/${order.itemId}/purchase?order_id=${order.id}&quantity=${order.quantity}`,
      mode: 'payment',
      invoice_creation: { enabled: true },
      payment_method_types: ['card'],
      line_items: lineItems,
      customer: stripeCustomerId,
      payment_intent_data: { metadata },
    });
    await this.orderRepository.update(order.id, { sessionId: session.id });
    return session;
  }

  async createOrder(userId: string, request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const order = this.orderRepository.create({ ...request, userId });
    await this.orderRepository.save(order);
    const session = await this.createOrderCheckoutSession(order);
    if (!session.url) {
      throw new HttpException(
        'Failed to create checkout session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { checkoutUrl: session.url };
  }

  async getOrderById(userId: string, orderId: string, status?: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId, status } });
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return mapOrderEntityToOrder(order);
  }

  async handleOrderPaymentSucceeded(orderId: string, paymentId: string) {
    await this.orderRepository.update(orderId, { status: OrderStatus.PAID, paymentId });
  }

  async createDashboardSessionUrl(userId: string): Promise<string> {
    const customerId = await this.getOrCreateCustomer(userId);
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: getDomain() + '/profile',
    });
    if (!session.url) {
      throw new HttpException(
        'Failed to create billing portal session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return session.url;
  }

  async getAllOrders(): Promise<DetailedOrder[]> {
    const orders = await this.orderRepository.find();
    const items = await this.getShopItems();
    const ordersWithItems = orders.map((order) => {
      const item = items.find((i) => i.id === order.itemId);
      return mapOrderEntityToDetailedOrder(order, item);
    });
    //
    return ordersWithItems;
  }

  async getOrderByIdAdmin(orderId: string): Promise<DetailedOrder> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    const item = await this.getShopItemById(order.itemId);
    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }
    const customer = await this.findCustomerByUserId(order.userId);
    return { ...mapOrderEntityToDetailedOrder(order, item), stripeCustomerId: customer?.id };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, adminId: string): Promise<void> {
    await this.orderRepository.update(orderId, { status });
    this.logger.log(`Order ${orderId} status updated to ${status} by admin ${adminId}`);
  }

  async joinWaitlist(userId: string, itemId: string): Promise<void> {
    // Check if item exists
    const item = await this.shopItemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }

    // Check if already on waitlist
    const existingEntry = await this.shopWaitlistRepository.findOne({
      where: { userId, itemId },
    });

    if (existingEntry) {
      throw new HttpException('Already on waitlist', HttpStatus.CONFLICT);
    }

    // Create waitlist entry
    const waitlistEntry = this.shopWaitlistRepository.create({ userId, itemId });
    await this.shopWaitlistRepository.save(waitlistEntry);
  }

  // #region: Digital Items
  private async ensureAllDecorationsHavePrices(): Promise<void> {
    const allDecorations = Object.values(MemorialDecoration);
    const existingPrices = await this.decorationPriceRepository.find();
    const existingDecorations = new Set(existingPrices.map((p) => p.decoration));

    const missingDecorations = allDecorations.filter(
      (decoration) => !existingDecorations.has(decoration),
    );

    if (missingDecorations.length > 0) {
      this.logger.warn(
        `Found ${missingDecorations.length} decorations without prices. Initializing with default price of ${DEFAULT_DECORATION_PRICE} cents.`,
      );

      const newPrices = missingDecorations.map((decoration) =>
        this.decorationPriceRepository.create({
          decoration,
          priceInCents: DEFAULT_DECORATION_PRICE,
        }),
      );

      await this.decorationPriceRepository.save(newPrices);

      this.logger.log(`Successfully initialized prices for: ${missingDecorations.join(', ')}`);
    } else {
      this.logger.log('All decorations have prices configured.');
    }
  }

  private async ensureAllWreathsHavePrices(): Promise<void> {
    const allWreaths = Object.values(MemorialDonationWreath);
    const existingPrices = await this.wreathPriceRepository.find();
    const existingWreaths = new Set(existingPrices.map((p) => p.wreath));

    const missingWreaths = allWreaths.filter((wreath) => !existingWreaths.has(wreath));

    if (missingWreaths.length > 0) {
      this.logger.warn(
        `Found ${missingWreaths.length} wreaths without prices. Initializing with default price of ${DEFAULT_WREATH_PRICE} cents.`,
      );

      const newPrices = missingWreaths.map((wreath) =>
        this.wreathPriceRepository.create({
          wreath,
          priceInCents: DEFAULT_WREATH_PRICE,
        }),
      );

      await this.wreathPriceRepository.save(newPrices);

      this.logger.log(`Successfully initialized prices for: ${missingWreaths.join(', ')}`);
    } else {
      this.logger.log('All wreaths have prices configured.');
    }
  }

  async getDecorationPrice(decoration: MemorialDecoration): Promise<number> {
    const priceEntity = await this.decorationPriceRepository.findOne({
      where: { decoration },
    });

    if (!priceEntity) {
      throw new HttpException('Decoration price not found', HttpStatus.NOT_FOUND);
    }

    return priceEntity.priceInCents;
  }

  async getAllDecorationPrices(): Promise<Record<MemorialDecoration, string>> {
    const prices = await this.decorationPriceRepository.find({
      order: { decoration: 'ASC' },
    });

    const pricesRecord = {} as Record<MemorialDecoration, string>;
    for (const priceEntity of prices) {
      pricesRecord[priceEntity.decoration] = formatPrice(priceEntity.priceInCents, 'usd');
    }

    return pricesRecord;
  }

  async getAllDecorationPricesInCents(): Promise<Record<MemorialDecoration, number>> {
    const cacheKey = 'decoration_prices_in_cents';

    // Try to get from cache
    const cachedPrices = await this.cacheManager.get<Record<MemorialDecoration, number>>(cacheKey);
    if (cachedPrices) {
      return cachedPrices;
    }

    // If not in cache, fetch from database
    const prices = await this.decorationPriceRepository.find({
      order: { decoration: 'ASC' },
    });

    const pricesRecord = {} as Record<MemorialDecoration, number>;
    for (const priceEntity of prices) {
      pricesRecord[priceEntity.decoration] = priceEntity.priceInCents;
    }

    // Store in cache with 1 minute TTL (60000ms)
    await this.cacheManager.set(cacheKey, pricesRecord, 60000);

    return pricesRecord;
  }

  async getAllWreathPrices(): Promise<Record<MemorialDonationWreath, string>> {
    const prices = await this.wreathPriceRepository.find({
      order: { priceInCents: 'DESC' },
    });

    const pricesRecord = {} as Record<MemorialDonationWreath, string>;
    for (const priceEntity of prices) {
      pricesRecord[priceEntity.wreath] = formatPrice(priceEntity.priceInCents, 'usd');
    }

    return pricesRecord;
  }

  async getAllWreathPricesInCents(): Promise<Record<MemorialDonationWreath, number>> {
    const cacheKey = 'wreath_prices_in_cents';

    // Try to get from cache
    const cachedPrices =
      await this.cacheManager.get<Record<MemorialDonationWreath, number>>(cacheKey);
    if (cachedPrices) {
      return cachedPrices;
    }

    // If not in cache, fetch from database
    const prices = await this.wreathPriceRepository.find({
      order: { priceInCents: 'ASC' },
    });
    const pricesRecord = {} as Record<MemorialDonationWreath, number>;
    for (const priceEntity of prices) {
      pricesRecord[priceEntity.wreath] = priceEntity.priceInCents;
    }

    // Store in cache with 1 minute TTL (60000ms)
    await this.cacheManager.set(cacheKey, pricesRecord, 60000);

    return pricesRecord;
  }

  async updateWreathPrice(
    wreath: MemorialDonationWreath,
    priceInCents: number,
  ): Promise<WreathPriceEntity> {
    let priceEntity = await this.wreathPriceRepository.findOne({
      where: { wreath },
    });

    if (!priceEntity) {
      priceEntity = this.wreathPriceRepository.create({
        wreath,
        priceInCents,
      });
    } else {
      priceEntity.priceInCents = priceInCents;
    }

    const result = await this.wreathPriceRepository.save(priceEntity);

    // Invalidate caches when price is updated
    await this.cacheManager.del('wreath_prices_in_cents');

    return result;
  }

  async updateDecorationPrice(
    decoration: MemorialDecoration,
    priceInCents: number,
  ): Promise<DecorationPriceEntity> {
    let priceEntity = await this.decorationPriceRepository.findOne({
      where: { decoration },
    });

    if (!priceEntity) {
      priceEntity = this.decorationPriceRepository.create({
        decoration,
        priceInCents,
      });
    } else {
      priceEntity.priceInCents = priceInCents;
    }

    const result = await this.decorationPriceRepository.save(priceEntity);

    // Invalidate caches when price is updated
    await Promise.all([
      this.cacheManager.del('decoration_prices_in_cents'),
      this.cacheManager.del('decoration-prices'),
    ]);

    return result;
  }

  private async ensureAllTributesHavePrices(): Promise<void> {
    const allTributes = Object.values(MemorialTribute);
    const existingPrices = await this.tributePriceRepository.find();
    const existingTributes = new Set(existingPrices.map((p) => p.tribute));

    const missingTributes = allTributes.filter((tribute) => !existingTributes.has(tribute));

    if (missingTributes.length > 0) {
      this.logger.warn(
        `Found ${missingTributes.length} tributes without prices. Initializing with appropriate prices.`,
      );

      const newPrices = missingTributes.map((tribute) =>
        this.tributePriceRepository.create({
          tribute,
          priceInCents: tribute === MemorialTribute.DEFAULT ? null : DEFAULT_TRIBUTE_PRICE,
        }),
      );

      await this.tributePriceRepository.save(newPrices);

      this.logger.log(`Successfully initialized prices for: ${missingTributes.join(', ')}`);
    } else {
      this.logger.log('All tributes have prices configured.');
    }
  }

  async getAllTributePrices(): Promise<Record<MemorialTribute, string | null>> {
    // If not in cache, fetch from database
    const prices = await this.tributePriceRepository.find({
      order: { tribute: 'ASC' },
    });

    const pricesRecord = {} as Record<MemorialTribute, string | null>;
    for (const priceEntity of prices) {
      pricesRecord[priceEntity.tribute] =
        priceEntity.priceInCents === null ? null : formatPrice(priceEntity.priceInCents, 'usd');
    }

    return pricesRecord;
  }

  async getAllTributePricesInCents(): Promise<Record<MemorialTribute, number | null>> {
    const cacheKey = 'tribute_prices_in_cents';

    // Try to get from cache
    const cachedPrices =
      await this.cacheManager.get<Record<MemorialTribute, number | null>>(cacheKey);
    if (cachedPrices) {
      return cachedPrices;
    }

    // If not in cache, fetch from database
    const prices = await this.tributePriceRepository.find({
      order: { tribute: 'ASC' },
    });

    const pricesRecord = {} as Record<MemorialTribute, number | null>;
    for (const priceEntity of prices) {
      pricesRecord[priceEntity.tribute] = priceEntity.priceInCents;
    }

    // Store in cache with 1 minute TTL (60000ms)
    await this.cacheManager.set(cacheKey, pricesRecord, 60000);

    return pricesRecord;
  }

  async getTributePrice(tribute: MemorialTribute): Promise<number | null> {
    const priceEntity = await this.tributePriceRepository.findOne({
      where: { tribute },
    });

    if (!priceEntity) {
      throw new HttpException('Tribute price not found', HttpStatus.NOT_FOUND);
    }

    return priceEntity.priceInCents;
  }

  async updateTributePrice(
    tribute: MemorialTribute,
    priceInCents: number | null,
  ): Promise<TributePriceEntity> {
    // Enforce constraint: DEFAULT tribute must have null price
    if (tribute === MemorialTribute.DEFAULT && priceInCents !== null) {
      throw new HttpException('DEFAULT tribute must have a null price', HttpStatus.BAD_REQUEST);
    }

    // Enforce constraint: Non-DEFAULT tributes cannot have null price
    if (tribute !== MemorialTribute.DEFAULT && priceInCents === null) {
      throw new HttpException('Only DEFAULT tribute can have a null price', HttpStatus.BAD_REQUEST);
    }

    let priceEntity = await this.tributePriceRepository.findOne({
      where: { tribute },
    });

    if (!priceEntity) {
      priceEntity = this.tributePriceRepository.create({
        tribute,
        priceInCents,
      });
    } else {
      priceEntity.priceInCents = priceInCents;
    }

    const result = await this.tributePriceRepository.save(priceEntity);

    // Invalidate caches when price is updated
    await Promise.all([
      this.cacheManager.del('tribute_prices_in_cents'),
      this.cacheManager.del('tribute-prices'),
    ]);

    return result;
  }
  // #endregion
}
