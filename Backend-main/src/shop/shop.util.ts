import { OrderEntity } from 'src/entities/OrderEntity';
import Stripe from 'stripe';
import { DetailedOrder, FeaturedShopItem, Order, ShopItem } from './interface/shop.interface';
import { ShopItemEntity } from 'src/entities/ShopItemEntity';
import { generateAssetUrl } from 'src/util/asset';
import { ShopFeaturedEntity } from 'src/entities/ShopFeaturedEntity';

export function getMetadataValueFromPaymentIntent(
  paymentIntent: string | Stripe.PaymentIntent | null,
  key: string,
): string | undefined {
  const value =
    typeof paymentIntent === 'object' && paymentIntent !== null && 'metadata' in paymentIntent
      ? paymentIntent.metadata[key] || null
      : null;
  return value || undefined;
}

export function mapOrderEntityToOrder(entity: OrderEntity): Order {
  return {
    id: entity.id,
    itemId: entity.itemId,
    quantity: entity.quantity,
    memorialId: entity.memorialId || undefined,
    firstName: entity.firstName,
    lastName: entity.lastName,
    country: entity.country,
    city: entity.city,
    address: entity.address,
    postCode: entity.postCode,
    state: entity.state,
    email: entity.email,
    phoneNumber: entity.phoneNumber,
    createdAt: entity.createdAt,
    status: entity.status,
    message: entity.message ?? undefined,
  };
}

export function mapOrderEntityToDetailedOrder(entity: OrderEntity, item?: ShopItem): DetailedOrder {
  return {
    ...mapOrderEntityToOrder(entity),
    userId: entity.userId,
    itemName: item?.name,
    totalPrice: item ? item.price * entity.quantity : undefined,
    stripeSessionId: entity.sessionId || undefined,
    stripePaymentId: entity.paymentId || undefined,
  };
}

export function mapShopItemEntityToShopItem(entity: ShopItemEntity, locale?: string): ShopItem {
  const baseItem: Omit<ShopItem, 'name' | 'description' | 'category'> = {
    id: entity.id,
    price: entity.priceInCents / 100,
    currency: 'USD',
    displayPrice: `$${(entity.priceInCents / 100).toFixed(2)}`,
    slug: entity.slug,
    status: entity.isActive ? 'available' : 'coming-soon',
    images: entity.imagePath.map((path) => generateAssetUrl(path)),
    userInWaitlist: entity.waitlist && entity.waitlist.length > 0 ? true : false,
  };

  switch (locale) {
    case 'tr':
      return {
        ...baseItem,
        name: entity.nameTr,
        description: entity.descriptionTr,
        category: entity.categoryTr,
      };
    default:
      return {
        ...baseItem,
        name: entity.nameEn,
        description: entity.descriptionEn,
        category: entity.categoryEn,
      };
  }
}

export function mapFeaturedShopItemEntityToFeaturedShopItem(
  entity: ShopFeaturedEntity,
  locale?: string,
): FeaturedShopItem {
  const baseItem: Omit<FeaturedShopItem, 'title' | 'description'> = {
    itemId: entity.itemId,
    itemSlug: entity.item.slug,
    imageUrl: generateAssetUrl(entity.imagePath),
  };

  switch (locale) {
    case 'tr':
      return {
        ...baseItem,
        title: entity.titleTr,
        description: entity.descriptionTr,
      };
    default:
      return {
        ...baseItem,
        title: entity.titleEn,
        description: entity.descriptionEn,
      };
  }
}
