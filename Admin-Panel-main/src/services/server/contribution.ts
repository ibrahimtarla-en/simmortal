'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { getBaseURL } from '../env';
import { Memory, Condolence, Donation } from '@/types/memorial';

export async function getMemoryById(memoryId: string): Promise<Memory | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/memory/${memoryId}`)
    .then((response: AxiosResponse<Memory>) => response.data)
    .catch((e) => {
      console.error('Error fetching memory details:', e.message, e.response?.status);
      return null;
    });
}

export async function getCondolenceById(condolenceId: string): Promise<Condolence | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/condolence/${condolenceId}`)
    .then((response: AxiosResponse<Condolence>) => response.data)
    .catch((e) => {
      console.error('Error fetching condolence details:', e.message, e.response?.status);
      return null;
    });
}

export async function getDonationById(donationId: string): Promise<Donation | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/donation/${donationId}`)
    .then((response: AxiosResponse<Donation>) => response.data)
    .catch((e) => {
      console.error('Error fetching donation details:', e.message, e.response?.status);
      return null;
    });
}
