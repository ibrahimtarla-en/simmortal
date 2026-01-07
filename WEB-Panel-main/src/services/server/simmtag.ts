'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { SimmTagLocation } from '@/types/simmtag';
import { getBaseURL } from '../env';

export async function createOrUpdateSimmTagLocation(memorialId: string, location: SimmTagLocation) {
  return axios
    .post(`${getBaseURL()}/api/v1/memorial/${memorialId}/simmtag`, { location })
    .then((response: AxiosResponse<void>) => response.data);
}
