export enum PublishMemorialContributionStatus {
  NEEDS_PAYMENT = 'needs-payment',
  PUBLISHED = 'published',
  IN_REVIEW = 'in-review',
}

export enum MemorialContributionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_REVIEW = 'in-review',
  REJECTED = 'rejected',
  REMOVED = 'removed',
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

export function isContributionNeedsPayment(
  response: PublishMemorialContributionResponse,
): response is PublishPaidMemorialContributionResponse {
  return response.status === PublishMemorialContributionStatus.NEEDS_PAYMENT;
}

export function isContributionPublished(
  response: PublishMemorialContributionResponse,
): response is PublishFreeMemorialContributionResponse {
  return (
    response.status === PublishMemorialContributionStatus.PUBLISHED ||
    response.status === PublishMemorialContributionStatus.IN_REVIEW
  );
}

export interface ValidatePurchaseResultResponse {
  success: boolean;
  redirectUrl: string;
}

export interface ContributionAuthor {
  name: string | null;
  verified: boolean;
  id: string;
}
