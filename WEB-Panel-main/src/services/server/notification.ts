'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { getBaseURL } from '../env';
import { PaginatedNotificationResponse } from '@/types/notification';

export async function getNotifications(cursor?: string) {
  return axios
    .get(`${getBaseURL()}/api/v1/notification`, { params: { cursor } })
    .then((response: AxiosResponse<PaginatedNotificationResponse>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function markNotificationRead(notificationId: string) {
  return axios
    .patch(`${getBaseURL()}/api/v1/notification/${notificationId}/read`)
    .then((response: AxiosResponse<void>) => response.data)
    .catch(() => {
      return null;
    });
}
