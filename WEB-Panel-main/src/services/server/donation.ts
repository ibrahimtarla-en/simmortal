'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { getBaseURL } from '../env';
import {
  PublishPaidMemorialContributionResponse,
  ValidatePurchaseResultResponse,
} from '@/types/contribution';
import { MemorialContributionSortField, MemorialDonationWreath } from '@/types/memorial';
import { PaginatedResult } from '@/types/pagination';
import { CreateDonationRequest, Donation } from '@/types/donation';

export async function createDonation(
  memorialSlug: string,
  wreath: MemorialDonationWreath,
): Promise<Donation> {
  const request: CreateDonationRequest = { wreath };
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/donation`, request, {})
    .then((res: AxiosResponse<Donation>) => {
      return res.data;
    });
}

export async function publishDonation(
  memorialSlug: string,
  donationId: string,
): Promise<PublishPaidMemorialContributionResponse> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/donation/${donationId}/publish`)
    .then((response: AxiosResponse<PublishPaidMemorialContributionResponse>) => response.data);
}

export async function validateDonationPurchase(
  memorialSlug: string,
  donationId: string,
  sessionId: string,
): Promise<ValidatePurchaseResultResponse> {
  return axios
    .post(
      `${getBaseURL()}/api/v1/memorial/${memorialSlug}/donation/${donationId}/validate-purchase?sessionId=${sessionId}`,
    )
    .then((response: AxiosResponse<ValidatePurchaseResultResponse>) => response.data);
}

export async function deleteDonation(memorialSlug: string, donationId: string): Promise<void> {
  await axios
    .delete(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/donation/${donationId}`)
    .then((res: AxiosResponse<void>) => res.data);
}

export async function getDonations(
  slug: string,
  cursor?: string,
  sort?: MemorialContributionSortField,
): Promise<PaginatedResult<Donation> | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/${slug}/donation`, { params: { cursor, sort } })
    .then((response: AxiosResponse<PaginatedResult<Donation>>) => {
      return response.data;
    })
    .catch(() => {
      return null;
    });
}
export async function getDonationById(
  memorialSlug: string,
  donationId: string,
): Promise<Donation | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/donation/${donationId}`)
    .then((response: AxiosResponse<Donation>) => {
      return response.data;
    })
    .catch(() => {
      return null;
    });
}

export async function likeDonation(memorialSlug: string, donationId: string): Promise<void> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/donation/${donationId}/like`)
    .then(() => {
      return;
    });
}

export async function unlikeDonation(memorialSlug: string, donationId: string): Promise<void> {
  return axios
    .delete(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/donation/${donationId}/like`)
    .then(() => {
      return;
    });
}
