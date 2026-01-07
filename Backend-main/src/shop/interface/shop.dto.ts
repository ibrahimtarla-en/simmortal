export interface CreateOrderRequest {
  memorialId: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  address: string;
  postCode: string;
  state: string;
  email: string;
  phoneNumber: string;
  itemId: string;
  quantity: number;
  message?: string;
}

export interface CreateOrderResponse {
  checkoutUrl: string;
}
