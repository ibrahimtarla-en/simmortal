import Stripe from 'stripe';
import { CondolenceEntity } from 'src/entities/CondolenceEntity';
import { Condolence } from './interface/condolence.interface';

export function mapCondolenceEntityToCondolence(entity: CondolenceEntity): Condolence {
  return {
    id: entity.id,
    content: entity.content,
    createdAt: entity.createdAt,
    decoration: entity.decoration,
    status: entity.status,
    author: {
      name: entity.owner.displayName,
      verified: false, // Placeholder until verification system is implemented
      id: entity.ownerId,
    },
    donationCount: entity.donationCount,
    totalLikes: entity.totalLikes || 0,
    memorialSlug: entity.memorial.premiumSlug || entity.memorial.defaultSlug,
  };
}

export function createCondolenceCheckoutBasket(
  entity: CondolenceEntity,
  decorationPrices: Record<string, number>,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  if (entity.decoration) {
    const decorationPrice = decorationPrices[entity.decoration];
    if (decorationPrice) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Condolence Decoration',
            description: 'Premium decoration for your condolence',
          },
          unit_amount: decorationPrice,
        },
        quantity: 1,
      });
    }
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
