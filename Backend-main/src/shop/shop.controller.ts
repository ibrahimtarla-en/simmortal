import { Body, Controller, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { ShopListingsResponse, ShopItem, Order, OrderStatus } from './interface/shop.interface';
import { PublicAccess, Session } from 'supertokens-nestjs';
import { ShopService } from './shop.service';
import Stripe from 'stripe';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CreateOrderRequest, CreateOrderResponse } from './interface/shop.dto';
import { SessionContainer } from 'supertokens-node/recipe/session';
import {
  MemorialDecoration,
  MemorialDonationWreath,
  MemorialTribute,
} from 'src/memorial/interface/memorial.interface';
import { PublicWithOptionalSession } from 'src/guard/optional-session.guard';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @PublicAccess()
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // Cache for 5 minutes
  async getShopContent(@Query('locale') locale?: string): Promise<ShopListingsResponse> {
    return this.shopService.getShopContent(locale);
  }

  @PublicWithOptionalSession()
  @Get('/:slug')
  async getShopItemBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
    @Session() session?: SessionContainer,
  ): Promise<ShopItem> {
    return this.shopService.getShopItemBySlug(slug, locale, session?.getUserId());
  }

  @PublicAccess()
  @Post('webhook')
  async handleWebhookEvent(@Body() event: Stripe.Event): Promise<void> {
    if (event.type === 'customer.subscription.created') {
      await this.shopService.handleSubscriptionCreated(event);
    }
    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await this.shopService.handleSubscriptionUpdated(event);
    } else if (event.type === 'payment_intent.succeeded') {
      await this.shopService.handlePaymentIntentSucceeded(event);
    }
    if (event.type === 'invoice.payment_succeeded') {
      await this.shopService.handleInvoicePaymentSucceeded(event);
    }
  }

  @Post('order')
  async createOrder(
    @Body() request: CreateOrderRequest,
    @Session() session: SessionContainer,
  ): Promise<CreateOrderResponse> {
    return this.shopService.createOrder(session.getUserId(), request);
  }

  @Get('order/:orderId')
  async getOrderById(
    @Param('orderId') orderId: string,
    @Query('status') status: OrderStatus,
    @Session() session: SessionContainer,
  ): Promise<Order> {
    return this.shopService.getOrderById(session.getUserId(), orderId, status);
  }

  @Post('waitlist/:itemId')
  async joinWaitlist(
    @Param('itemId') itemId: string,
    @Session() session: SessionContainer,
  ): Promise<void> {
    return this.shopService.joinWaitlist(session.getUserId(), itemId);
  }

  @Get('price/decoration')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('decoration-prices')
  @CacheTTL(60000) // Cache for 1 minute
  async getDecorationPrices(): Promise<Record<MemorialDecoration, string>> {
    return this.shopService.getAllDecorationPrices();
  }

  @Get('price/tribute')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('tribute-prices')
  @CacheTTL(60000) // Cache for 1 minute
  async getTributePrices(): Promise<Record<MemorialTribute, string | null>> {
    return this.shopService.getAllTributePrices();
  }

  @PublicAccess()
  @Get('price/wreath')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('wreath-prices')
  @CacheTTL(60000) // Cache for 1 minute
  async getWreathPrices(): Promise<Record<MemorialDonationWreath, string>> {
    return this.shopService.getAllWreathPrices();
  }
}
