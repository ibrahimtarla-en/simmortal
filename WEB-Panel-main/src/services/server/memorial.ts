'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { getBaseURL } from '../env';
import {
  AiGreeting,
  CheckSlugAvailabilityRequest,
  CheckSlugAvailabilityResponse,
  Memorial,
  MemorialFlag,
  MemorialFlagableContent,
  MemorialFlagReason,
  MemorialFlagStatus,
  MemorialFlagType,
  OwnedMemorialPreview,
  PremiumMemorialPricesResponse,
  PublishedMemorial,
  PublishFreeMemorialResponse,
  PublishMemorialPreview,
  TopContributor,
  ValidateSubscriptionResultResponse,
} from '@/types/memorial';
import { exists } from '@/utils/exists';

export async function getOwnedMemorial(memorialId: string, recommendSlug?: boolean) {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/owned/${memorialId}`, { params: { recommendSlug } })
    .then((response: AxiosResponse<Memorial>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function deleteOwnedMemorial(memorialId: string) {
  return axios
    .delete(`${getBaseURL()}/api/v1/memorial/owned/${memorialId}`)
    .then((response: AxiosResponse<void>) => response.data);
}

export async function checkSlugAvailability(slug: string, memorialId: string) {
  const request: CheckSlugAvailabilityRequest = { slug, memorialId };
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/check-slug`, request)
    .then((response: AxiosResponse<CheckSlugAvailabilityResponse>) => response.data);
}

export async function updateMemorial(memorialId: string, payload: Partial<Memorial>) {
  await axios.patch(`${getBaseURL()}/api/v1/memorial/owned/${memorialId}`, payload);
}

export async function getPublishedMemorialBySlug(slug: string) {
  const memorial = await axios
    .get(`${getBaseURL()}/api/v1/memorial/published/${slug}`)
    .then((response: AxiosResponse<PublishedMemorial>) => response.data)
    .catch(() => null);

  if (exists(memorial)) {
    registerMemorialViewBySlug(slug); // Fire and forget
  }

  return memorial;
}

export async function getPublishedMemorialById(
  memorialId: string,
): Promise<PublishedMemorial | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/published/id/${memorialId}`)
    .then((response: AxiosResponse<PublishedMemorial>) => response.data)
    .catch(() => null);
}

function registerMemorialViewBySlug(slug: string) {
  // No async/await since we're fire-and-forget
  axios.post(`${getBaseURL()}/api/v1/memorial/published/${slug}/view`).catch((error) => {
    console.warn('Failed to register memorial view for slug:', slug, error.message);
  });
}

export async function createMemorialPreview(memorialId: string, overrides?: Partial<Memorial>) {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/preview/${memorialId}`, overrides)
    .then((response: AxiosResponse<PublishedMemorial>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function getMemorialPublishPreview(
  memorialId: string,
): Promise<PublishMemorialPreview | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/publish-preview/${memorialId}`)
    .then((response: AxiosResponse<PublishMemorialPreview>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function createPremiumSubscriptionLink(
  memorialId: string,
  period: 'month' | 'year',
): Promise<string | null> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/purchase-premium/${memorialId}`, { period })
    .then((response: AxiosResponse<string>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function validateSubscriptionResult(
  sessionId: string,
  publishOnValidation = false,
): Promise<ValidateSubscriptionResultResponse> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/validate-subscription/${sessionId}`, {
      publishOnValidation,
    })
    .then((response: AxiosResponse<ValidateSubscriptionResultResponse>) => response.data)
    .catch(() => {
      return { success: false, redirectUrl: '/' };
    });
}

export async function publishFreeMemorial(
  memorialId: string,
): Promise<PublishFreeMemorialResponse> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/publish-free/${memorialId}`)
    .then((response: AxiosResponse<PublishFreeMemorialResponse>) => response.data);
}

export async function likeMemorial(slug: string): Promise<void> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/published/${slug}/like`)
    .then(() => {
      return;
    })
    .catch();
}

export async function unlikeMemorial(slug: string): Promise<void> {
  return axios
    .delete(`${getBaseURL()}/api/v1/memorial/published/${slug}/like`)
    .then(() => {
      return;
    })
    .catch();
}

export async function searchMemorials(query: string, limit?: number): Promise<PublishedMemorial[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/search`, { params: { query, limit } })
    .then((response: AxiosResponse<PublishedMemorial[]>) => response.data);
}

export async function getFeaturedMemorials(limit?: number): Promise<PublishedMemorial[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/featured`, { params: { limit } })
    .then((response: AxiosResponse<PublishedMemorial[]>) => response.data)
    .catch(() => {
      return [];
    });
}

export async function getPremiumMemorialPrices(): Promise<PremiumMemorialPricesResponse> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/premium-prices`)
    .then((response: AxiosResponse<PremiumMemorialPricesResponse>) => response.data);
}

export async function getOwnedMemorialPreviews(): Promise<OwnedMemorialPreview[] | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/owned-preview`)
    .then((response: AxiosResponse<OwnedMemorialPreview[]>) => response.data)
    .catch((e) => {
      console.error('Error fetching owned memorials:', e.message);
      return null;
    });
}

export async function getMemorialFlags(slug: string): Promise<MemorialFlag[] | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/published/${slug}/flag`)
    .then((response: AxiosResponse<MemorialFlag[]>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function handleMemorialFlag(flagId: string, status: MemorialFlagStatus) {
  return axios.patch(`${getBaseURL()}/api/v1/memorial/flag/${flagId}`, { status }).then(() => {
    return;
  });
}

export async function reportMemorialContent(
  referenceId: string,
  contentType: MemorialFlagableContent,
  reason?: MemorialFlagReason,
): Promise<void> {
  let type: MemorialFlagType;
  switch (contentType) {
    case 'memory':
      type = MemorialFlagType.MEMORY_REPORT;
      break;
    case 'condolence':
      type = MemorialFlagType.CONDOLENCE_REPORT;
      break;
    case 'memorial':
      type = MemorialFlagType.MEMORIAL_REPORT;
      break;
    case 'donation':
      type = MemorialFlagType.DONATION_REPORT;
      break;
    default:
      throw new Error('Invalid content type for reporting');
  }
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/published/flag`, { referenceId, type, reason })
    .then(() => {
      return;
    });
}

export async function resetAiMemorialGreetingCreation(memorialId: string): Promise<void> {
  return axios.delete(`${getBaseURL()}/api/v1/memorial/ai-greeting/${memorialId}`).then(() => {
    return;
  });
}

export async function getAiMemorialGreeting(memorialId: string): Promise<AiGreeting | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/ai-greeting/${memorialId}`)
    .then((response: AxiosResponse<AiGreeting>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function getTopFlowerContributors(slug: string): Promise<TopContributor[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/published/${slug}/top-contributors/flowers`)
    .then((response: AxiosResponse<TopContributor[]>) => response.data)
    .catch(() => {
      return [];
    });
}

export async function getTopDonationContributors(slug: string): Promise<TopContributor[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/published/${slug}/top-contributors/donations`)
    .then((response: AxiosResponse<TopContributor[]>) => response.data)
    .catch(() => {
      return [];
    });
}

export async function getTopCandleContributors(slug: string): Promise<TopContributor[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/published/${slug}/top-contributors/candles`)
    .then((response: AxiosResponse<TopContributor[]>) => response.data)
    .catch(() => {
      return [];
    });
}

export async function getTopTreeContributors(slug: string): Promise<TopContributor[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/published/${slug}/top-contributors/trees`)
    .then((response: AxiosResponse<TopContributor[]>) => response.data)
    .catch(() => {
      return [];
    });
}
