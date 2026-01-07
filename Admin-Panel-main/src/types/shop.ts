export interface Order {
  id: string;
  createdAt: string;
  memorialId?: string;
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
  status: OrderStatus;
  message?: string;
}

export interface DetailedOrder extends Order {
  userId: string;
  itemName?: string;
  totalPrice?: number;
  stripeSessionId?: string;
  stripePaymentId?: string;
  stripeCustomerId?: string;
}

export enum OrderStatus {
  CREATED = 'created',
  PAID = 'paid',
  COMPLETED = 'completed',
}
