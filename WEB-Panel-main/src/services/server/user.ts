'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { Nullable } from '@/types/util';
import { SimmortalsUser } from '@/types/user';
import { getBaseURL } from '../env';
import { PaginatedResult } from '@/types/pagination';
import { MemorialContributionSortField } from '@/types/memorial';
import { Memory, MemoryWithMemorialInfo } from '@/types/memory';
import { Condolence } from '@/types/condolence';
import { logout } from './auth/supertokens';
import { cookies } from 'next/headers';
import { DonationWithMemorialInfo } from '@/types/donation';

export async function getUser() {
  return axios
    .get(`${getBaseURL()}/api/v1/user`)
    .then((response: AxiosResponse<Nullable<SimmortalsUser>>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function sendPhoneNumberValidationCode(phoneNumber: string) {
  await axios.post(`${getBaseURL()}/api/v1/user/phone-number/send-validation-code`, {
    phoneNumber,
  });
}

export async function consumePhoneNumberValidationCode(phoneNumber: string, code: string) {
  await axios.post(`${getBaseURL()}/api/v1/user/phone-number/consume-validation-code`, {
    phoneNumber,
    code,
  });
}

export async function getDashboardUrl() {
  return axios
    .get(`${getBaseURL()}/api/v1/user/dashboard`)
    .then((response: AxiosResponse<{ url: string }>) => response.data);
}

export async function getLikedMemories(
  cursor?: string,
  sort?: MemorialContributionSortField,
): Promise<PaginatedResult<Memory>> {
  return axios
    .get(`${getBaseURL()}/api/v1/user/liked-memories`, {
      params: { cursor, sort },
    })
    .then((response: AxiosResponse<PaginatedResult<MemoryWithMemorialInfo>>) => response.data);
}

export async function getOwnedMemories(
  cursor?: string,
  sort?: MemorialContributionSortField,
): Promise<PaginatedResult<Memory>> {
  return axios
    .get(`${getBaseURL()}/api/v1/user/owned-memories`, {
      params: { cursor, sort },
    })
    .then((response: AxiosResponse<PaginatedResult<MemoryWithMemorialInfo>>) => response.data);
}

export async function getLikedCondolences(
  cursor?: string,
  sort?: MemorialContributionSortField,
): Promise<PaginatedResult<Condolence>> {
  return axios
    .get(`${getBaseURL()}/api/v1/user/liked-condolences`, {
      params: { cursor, sort },
    })
    .then((response: AxiosResponse<PaginatedResult<Condolence>>) => response.data);
}

export async function getOwnedCondolences(
  cursor?: string,
  sort?: MemorialContributionSortField,
): Promise<PaginatedResult<Condolence>> {
  return axios
    .get(`${getBaseURL()}/api/v1/user/owned-condolences`, {
      params: { cursor, sort },
    })
    .then((response: AxiosResponse<PaginatedResult<Condolence>>) => response.data);
}

export async function getLikedDonations(
  cursor?: string,
  sort?: MemorialContributionSortField,
): Promise<PaginatedResult<DonationWithMemorialInfo>> {
  return axios
    .get(`${getBaseURL()}/api/v1/user/liked-donations`, {
      params: { cursor, sort },
    })
    .then((response: AxiosResponse<PaginatedResult<DonationWithMemorialInfo>>) => response.data);
}

export async function getOwnedDonations(
  cursor?: string,
  sort?: MemorialContributionSortField,
): Promise<PaginatedResult<DonationWithMemorialInfo>> {
  return axios
    .get(`${getBaseURL()}/api/v1/user/owned-donations`, {
      params: { cursor, sort },
    })
    .then((response: AxiosResponse<PaginatedResult<DonationWithMemorialInfo>>) => response.data);
}

export async function deleteAccount() {
  await axios.delete(`${getBaseURL()}/api/v1/user`);
  await logout().catch(() => {});
  const cookieHandler = await cookies();
  await Promise.all([
    cookieHandler.delete('sAccessToken'),
    cookieHandler.delete('sRefreshToken'),
    cookieHandler.delete('sFrontToken'),
  ]);
}
