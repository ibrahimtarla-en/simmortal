export type ShopItemStatus = 'available' | 'coming-soon';

export interface ShopListingsResponse {
  featuredItems: FeaturedShopItem[];
  items: ShopItem[];
  categories: string[];
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  images: string[];
  slug: string;
  status: ShopItemStatus;
  currency: string;
  displayPrice: string;
  price: number;
  category: string[];
  userInWaitlist?: boolean;
}

export interface FeaturedShopItem {
  itemId: string;
  itemSlug: string;
  imageUrl: string;
  title: string;
  description: string;
}

export interface MemorialContributionMetadata {
  userId: string;
  memorialId: string;
  memorialSlug: string;
  id: string;
  type: 'memory' | 'condolence' | 'donation';
}

export interface Order {
  id: string;
  createdAt: Date;
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
