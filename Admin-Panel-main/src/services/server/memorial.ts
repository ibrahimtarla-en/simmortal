'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { getBaseURL } from '../env';
import {
  AdminMemorial,
  AdminMemorialDetails,
  MemorialFlagStatus,
  OwnedMemorialPreview,
} from '@/types/memorial';

export async function getPublishedMemorials(): Promise<AdminMemorial[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/memorials`)
    .then((response: AxiosResponse<AdminMemorial[]>) => {
      return response.data;
    });
}

export async function addFeaturedMemorial(memorialId: string): Promise<void> {
  return axios.post(`${getBaseURL()}/api/v1/admin/memorials/featured/${memorialId}`).then(() => {
    return;
  });
}

export async function removeFeaturedMemorial(memorialId: string): Promise<void> {
  return axios.delete(`${getBaseURL()}/api/v1/admin/memorials/featured/${memorialId}`).then(() => {
    return;
  });
}

export async function getOwnedMemorialPreviews(
  userId: string,
): Promise<OwnedMemorialPreview[] | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/users/memorials/${userId}`)
    .then((response: AxiosResponse<OwnedMemorialPreview[]>) => response.data)
    .catch((e) => {
      console.error('Error fetching owned memorials:', e.message);
      return null;
    });
}

export async function getMemorialById(
  memorialId: string,
): Promise<AdminMemorialDetails | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/memorials/${memorialId}`)
    .then((response: AxiosResponse<AdminMemorialDetails>) => response.data)
    .catch((e) => {
      console.error('Error fetching memorial details:', e.message);
      return null;
    });
}

export async function handleMemorialFlag(flagId: string, status: MemorialFlagStatus) {
  return axios.patch(`${getBaseURL()}/api/v1/memorial/flag/${flagId}`, { status }).then(() => {
    return;
  });
}
