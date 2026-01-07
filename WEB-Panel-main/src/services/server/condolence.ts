'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { getBaseURL } from '../env';
import {
  PublishMemorialContributionResponse,
  ValidatePurchaseResultResponse,
} from '@/types/contribution';
import { MemorialContributionSortField } from '@/types/memorial';
import { PaginatedResult } from '@/types/pagination';
import { Condolence, CreateCondolenceRequest } from '@/types/condolence';

export async function createCondolence(
  memorialId: string,
  data: CreateCondolenceRequest,
): Promise<Condolence> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/${memorialId}/condolence`, data, {})
    .then((res: AxiosResponse<Condolence>) => {
      return res.data;
    });
}

export async function updateCondolence(
  memorialId: string,
  condolenceId: string,
  payload: Partial<Condolence>,
): Promise<void> {
  await axios.patch(
    `${getBaseURL()}/api/v1/memorial/${memorialId}/condolence/${condolenceId}`,
    payload,
  );
}

export async function createCondolencePreview(
  memorialSlug: string,
  condolenceId: string,
  overrides?: Partial<Condolence>,
): Promise<Condolence | null> {
  return axios
    .post(
      `${getBaseURL()}/api/v1/memorial/${memorialSlug}/condolence/${condolenceId}/preview`,
      overrides,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
    .then((response: AxiosResponse<Condolence>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function publishCondolence(
  memorialId: string,
  condolenceId: string,
): Promise<PublishMemorialContributionResponse> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/${memorialId}/condolence/${condolenceId}/publish`)
    .then((response: AxiosResponse<PublishMemorialContributionResponse>) => response.data);
}

export async function validateCondolencePurchase(
  memorialId: string,
  condolenceId: string,
  sessionId: string,
): Promise<ValidatePurchaseResultResponse> {
  return axios
    .post(
      `${getBaseURL()}/api/v1/memorial/${memorialId}/condolence/${condolenceId}/validate-purchase?sessionId=${sessionId}`,
    )
    .then((response: AxiosResponse<ValidatePurchaseResultResponse>) => response.data);
}

export async function deleteCondolence(memorialSlug: string, condolenceId: string): Promise<void> {
  await axios
    .delete(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/condolence/${condolenceId}`)
    .then((res: AxiosResponse<void>) => res.data);
}

export async function getCondolences(
  slug: string,
  cursor?: string,
  sort?: MemorialContributionSortField,
): Promise<PaginatedResult<Condolence> | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/${slug}/condolence`, { params: { cursor, sort } })
    .then((response: AxiosResponse<PaginatedResult<Condolence>>) => {
      return response.data;
    })
    .catch(() => {
      return null;
    });
}

export async function likeCondolence(memorialSlug: string, condolenceId: string): Promise<void> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/condolence/${condolenceId}/like`)
    .then(() => {
      return;
    });
}

export async function unlikeCondolence(memorialSlug: string, condolenceId: string): Promise<void> {
  return axios
    .delete(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/condolence/${condolenceId}/like`)
    .then(() => {
      return;
    });
}
