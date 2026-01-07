import { MemoryEntity } from 'src/entities/MemoryEntity';
import Stripe from 'stripe';
import { generateAssetUrl } from 'src/util/asset';
import { BaseMemory, Memory } from './interface/memory.interface';
import { MemorialDecoration, MemorialTribute } from '../interface/memorial.interface';

export function mapMemoryEntityToMemory(entity: MemoryEntity): Memory {
  const memory: BaseMemory = {
    id: entity.id,
    content: entity.content,
    date: entity.date,
    createdAt: entity.createdAt,
    donationCount: entity.donationCount,
    memorialSlug: entity.memorial.premiumSlug || entity.memorial.defaultSlug,
    status: entity.status,
    author: {
      name: entity.owner.displayName,
      verified: false, // Placeholder until verification system is implemented
      id: entity.ownerId,
    },
    totalLikes: entity.totalLikes || 0,
  };
  if (entity.assetPath && entity.assetType) {
    return {
      ...memory,
      assetPath: entity.assetPath && generateAssetUrl(entity.assetPath),
      assetType: entity.assetType,
      assetDecoration: entity.assetDecoration,
    };
  } else if (entity.decoration) {
    return {
      ...memory,
      decoration: entity.decoration,
    };
  }
  return { ...memory, decoration: null };
}

export function createMemoryCheckoutBasket(
  entity: MemoryEntity,
  decorationPrices: Record<MemorialDecoration, number>,
  tributePrices: Record<MemorialTribute, number | null>,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  if (entity.assetPath && entity.assetDecoration) {
    const tributePrice = tributePrices[entity.assetDecoration];
    if (tributePrice) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Memory Decoration',
            description: 'Premium decoration for your memory',
          },
          unit_amount: tributePrice,
        },
        quantity: 1,
      });
    }
  } else if (entity.decoration) {
    const decorationPrice = decorationPrices[entity.decoration];
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Memory Decoration',
          description: 'Premium decoration for your memory',
        },
        unit_amount: decorationPrice,
      },
      quantity: 1,
    });
  }
  if (entity.donationCount > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'TEMA Tree Donation',
          description: 'Donation to plant trees in memory of your loved one',
        },
        unit_amount: 100, // Convert dollars to cents
      },
      quantity: entity.donationCount,
    });
  }
  return lineItems;
}
