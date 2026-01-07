'use server';
import axios, { AxiosResponse } from 'axios';
import './axios.interceptor';
import { Nullable } from '@/types/util';
import { getBaseURL } from '../env';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  OrderStatus,
  ShopItem,
  ShopListing,
} from '@/types/shop';
import { MemorialDecoration, MemorialDonationWreath, MemorialTribute } from '@/types/memorial';

export async function getShopList(locale: string) {
  return axios
    .get(`${getBaseURL()}/api/v1/shop`, { params: { locale } })
    .then((response: AxiosResponse<Nullable<ShopListing>>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function getProduct(slug: string, locale: string) {
  return axios
    .get(`${getBaseURL()}/api/v1/shop/${slug}`, { params: { locale } })
    .then((response: AxiosResponse<Nullable<ShopItem>>) => response.data)
    .catch(() => {
      return null;
    });
}

export async function createOrder(request: CreateOrderRequest) {
  return axios
    .post(`${getBaseURL()}/api/v1/shop/order`, request)
    .then((response: AxiosResponse<CreateOrderResponse>) => response.data);
}

export async function getOrderById(orderId: string, status?: OrderStatus) {
  return axios
    .get(`${getBaseURL()}/api/v1/shop/order/${orderId}`, { params: { status } })
    .then((response: AxiosResponse<Order>) => response.data)
    .catch(() => {
      return null;
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

export async function getWreathPrices() {
  return axios
    .get(`${getBaseURL()}/api/v1/shop/price/wreath`)
    .then((response: AxiosResponse<Record<MemorialDonationWreath, string>>) => response.data);
}

export async function joinWaitlistForItem(itemId: string) {
  return axios
    .post(`${getBaseURL()}/api/v1/shop/waitlist/${itemId}`)
    .then((response: AxiosResponse<void>) => response.data);
}
