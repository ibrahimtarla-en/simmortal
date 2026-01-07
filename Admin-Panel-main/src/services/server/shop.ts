'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { getBaseURL } from '../env';
import { DetailedOrder, OrderStatus } from '@/types/shop';
import { MemorialDecoration, MemorialTribute } from '@/types/memorial';

export async function getOpenOrders(): Promise<DetailedOrder[]> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/shop/orders`)
    .then((response: AxiosResponse<DetailedOrder[]>) => {
      return response.data;
    });
}

export async function getOrderById(orderId: string): Promise<DetailedOrder | null> {
  return axios
    .get(`${getBaseURL()}/api/v1/admin/shop/orders/${orderId}`)
    .then((response: AxiosResponse<DetailedOrder>) => {
      return response.data;
    })
    .catch((e) => {
      console.error('Error fetching order by ID:', e.message);
      return null;
    });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return axios
    .patch(`${getBaseURL()}/api/v1/admin/shop/orders/${orderId}/status`, { status })
    .then((response: AxiosResponse<void>) => {
      return response.data;
    });
}

export async function getDecorationPrices() {
  return axios
    .get(`${getBaseURL()}/api/v1/shop/price/decoration`)
    .then((response: AxiosResponse<Record<MemorialDecoration, string>>) => response.data);
}

export async function getTributePrices() {
  return axios
    .get(`${getBaseURL()}/api/v1/shop/price/tribute`)
    .then((response: AxiosResponse<Record<MemorialTribute, string | null>>) => response.data);
}

export async function updateDecorationPrice(decoration: MemorialDecoration, priceInCents: number) {
  return axios
    .patch(`${getBaseURL()}/api/v1/admin/price/decoration/${decoration}`, {
      priceInCents,
    })
    .then((response: AxiosResponse<void>) => {
      return response.data;
    });
}

export async function updateTributePrice(tribute: MemorialTribute, priceInCents: number) {
  return axios
    .patch(`${getBaseURL()}/api/v1/admin/price/tribute/${tribute}`, {
      priceInCents,
    })
    .then((response: AxiosResponse<void>) => {
      return response.data;
    });
}
