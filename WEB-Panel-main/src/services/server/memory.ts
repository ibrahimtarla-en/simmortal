'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { getBaseURL } from '../env';
import { Memory, UpdateMemoryPayload } from '@/types/memory';
import { createFormData } from '@/utils/formdata';
import {
  PublishMemorialContributionResponse,
  ValidatePurchaseResultResponse,
} from '@/types/contribution';
import { MemorialContributionSortField } from '@/types/memorial';
import { PaginatedResult } from '@/types/pagination';

export async function updateMemory(
  memorialSlug: string,
  memoryId: string,
  payload: Partial<UpdateMemoryPayload>,
): Promise<void> {
  const formdata = createFormData(payload);
  await axios.patch(
    `${getBaseURL()}/api/v1/memorial/${memorialSlug}/memory/${memoryId}`,
    formdata,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
}

export async function createMemoryPreview(
  memorialSlug: string,
  memoryId: string,
  overrides?: Partial<Memory>,
): Promise<Memory | null> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/memory/${memoryId}/preview`, overrides, {
      headers: { 'Content-Type': 'application/json' },
    })
    .then((response: AxiosResponse<Memory>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function publishMemory(
  memorialId: string,
  memoryId: string,
): Promise<PublishMemorialContributionResponse> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/${memorialId}/memory/${memoryId}/publish`)
    .then((response: AxiosResponse<PublishMemorialContributionResponse>) => response.data);
}

export async function validateMemoryPurchase(
  memorialId: string,
  memoryId: string,
  sessionId: string,
): Promise<ValidatePurchaseResultResponse> {
  return axios
    .post(
      `${getBaseURL()}/api/v1/memorial/${memorialId}/memory/${memoryId}/validate-purchase?sessionId=${sessionId}`,
    )
    .then((response: AxiosResponse<ValidatePurchaseResultResponse>) => response.data);
}

export async function deleteMemory(memorialSlug: string, memoryId: string): Promise<void> {
  await axios
    .delete(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/memory/${memoryId}`)
    .then((res: AxiosResponse<void>) => res.data);
}

export async function getMemories(
  slug: string,
  cursor?: string,
  sort?: MemorialContributionSortField,
): Promise<PaginatedResult<Memory> | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/memorial/${slug}/memory`, { params: { cursor, sort } })
    .then((response: AxiosResponse<PaginatedResult<Memory>>) => {
      return response.data;
    })
    .catch(() => {
      return null;
    });
}

export async function likeMemory(memorialSlug: string, memoryId: string): Promise<void> {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/memory/${memoryId}/like`)
    .then(() => {
      return;
    });
}

export async function unlikeMemory(memorialSlug: string, memoryId: string): Promise<void> {
  return axios
    .delete(`${getBaseURL()}/api/v1/memorial/${memorialSlug}/memory/${memoryId}/like`)
    .then(() => {
      return;
    });
}
