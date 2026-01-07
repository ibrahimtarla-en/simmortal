import {
  MemorialContributionSortField,
  MemorialFlagReason,
  MemorialFlagType,
  RelationToDeceased,
} from './memorial.interface';

export interface CreateMemorialRequest {
  name: string;
  dateOfBirth: string;
  dateOfDeath: string;
  ownerRelation: RelationToDeceased;
  originCountry: string;
  unlisted: boolean;
}

export interface CreateMemorialResponse {
  id: string;
}

export interface CheckSlugAvailabilityRequest {
  slug: string;
  memorialId: string;
}

export interface CheckSlugAvailabilityResponse {
  isAvailable: boolean;
}

export interface ValidatePurchaseResultResponse {
  success: boolean;
  redirectUrl: string;
}

export interface PublishFreeMemorialResponse {
  redirectUrl: string;
}

export interface PurchasePremiumMemorialRequest {
  period: 'month' | 'year';
}

export interface PremiumPricesResponse {
  monthlyPrice: string;
  yearlyPrice: string;
  freePrice: string;
}

export enum PublishMemorialContributionStatus {
  NEEDS_PAYMENT = 'needs-payment',
  PUBLISHED = 'published',
  IN_REVIEW = 'in-review',
}

export interface PublishPaidMemorialContributionResponse {
  paymentUrl: string;
  status: PublishMemorialContributionStatus.NEEDS_PAYMENT;
}

interface PublishFreeMemorialContributionResponse {
  status: PublishMemorialContributionStatus.PUBLISHED | PublishMemorialContributionStatus.IN_REVIEW;
}

export type PublishMemorialContributionResponse =
  | PublishPaidMemorialContributionResponse
  | PublishFreeMemorialContributionResponse;

export interface GetMemorialMemoriesRequest {
  sort?: MemorialContributionSortField;
  cursor?: string;
}

export interface CreateMemorialFlagRequest {
  type:
    | MemorialFlagType.CONDOLENCE_REPORT
    | MemorialFlagType.MEMORY_REPORT
    | MemorialFlagType.MEMORIAL_REPORT;
  referenceId: string;
  reason?: MemorialFlagReason;
}
