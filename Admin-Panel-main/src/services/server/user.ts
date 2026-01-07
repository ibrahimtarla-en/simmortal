'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { AdminUserDetails, SimmortalsUser, UserAccountStatus } from '@/types/user';
import { getBaseURL } from '../env';
import { Nullable } from '@/types/util';

export async function getUsers(): Promise<SimmortalsUser[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/users`)
    .then((response: AxiosResponse<SimmortalsUser[]>) => {
      return response.data;
    });
}

export async function getUser(id: string): Promise<AdminUserDetails | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/users/${id}`)
    .then((response: AxiosResponse<Nullable<AdminUserDetails>>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function getUserCustomerId(id: string): Promise<Nullable<string>> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/users/${id}/customer`)
    .then((response: AxiosResponse<Nullable<string>>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function updateUserStatus(
  id: string,
  status: UserAccountStatus.ACTIVE | UserAccountStatus.SUSPENDED,
): Promise<void> {
  return axios
    .patch(`${getBaseURL()}/api/v1/admin/users/${id}/status`, { status })
    .then(() => {})
    .catch(() => {
      throw new Error('Failed to update user status');
    });
}
