export interface ShopListing {
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

export enum ShopItemStatus {
  AVAILABLE = 'available',
  COMING_SOON = 'coming-soon',
}
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
}

export interface CreateOrderResponse {
  checkoutUrl: string;
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
}

export enum OrderStatus {
  CREATED = 'created',
  PAID = 'paid',
  COMPLETED = 'completed',
}
