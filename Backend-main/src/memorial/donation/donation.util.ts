import { DonationEntity } from 'src/entities/DonationEntity';
import { Donation } from './interface/donation.interface';
import { MemorialDonationWreath } from '../interface/memorial.interface';
import Stripe from 'stripe';
import { HttpException, HttpStatus } from '@nestjs/common';

export function mapDonationEntityToDonation(entity: DonationEntity): Donation {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    wreath: entity.wreath,
    status: entity.status,
    author: {
      name: entity.owner.displayName,
      verified: false, // Placeholder until verification system is implemented
      id: entity.ownerId,
    },
    totalLikes: entity.totalLikes || 0,
    memorialSlug: entity.memorial.premiumSlug || entity.memorial.defaultSlug,
  };
}

export function getDonationItemCountFromWreath(wreath: MemorialDonationWreath): number {
  switch (wreath) {
    case MemorialDonationWreath.SILVER:
      return 10;
    case MemorialDonationWreath.ROSE:
      return 25;
    case MemorialDonationWreath.GOLD:
      return 50;
    case MemorialDonationWreath.PURPLE:
      return 100;
  }
}

export function createDonationCheckoutBasket(
  entity: DonationEntity,
  donationPrices: Record<string, number>,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const decorationPrice = donationPrices[entity.wreath];
  if (!decorationPrice) {
    throw new HttpException('Invalid wreath type', HttpStatus.BAD_REQUEST);
  }
  return [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Memorial Donation',
          description: 'Donation wreath for memorial',
        },
        unit_amount: decorationPrice,
      },
      quantity: 1,
    },
  ];
}
