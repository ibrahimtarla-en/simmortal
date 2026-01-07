'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { getBaseURL } from '../env';
import { AdminMemorialFlag } from '@/types/memorial';

export async function getOpenMemorialFlags(): Promise<AdminMemorialFlag[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/memorial-flags`)
    .then((response: AxiosResponse<AdminMemorialFlag[]>) => {
      return response.data;
    });
}
