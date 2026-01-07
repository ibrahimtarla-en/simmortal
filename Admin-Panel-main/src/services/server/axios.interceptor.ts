import axios from 'axios';
import { ensureSuperTokensInit } from '@/config/backend';
import { getAccessToken } from './auth/sessionSSRHelper';

ensureSuperTokensInit();

axios.interceptors.request.use(async (request) => {
  if (request.url?.includes('googleapis')) {
    return request;
  }
  const accessToken = await getAccessToken();
  request.headers['Authorization'] = `Bearer ${accessToken}`;
  return request;
});
