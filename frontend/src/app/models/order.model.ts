export interface Order {
  id: string;
  customerId: number;
  customerName: string;
  phone: string;
  address: string;
  size: string;
  product: string;
  productId?: number;
  price?: number;
  quantity: number;
  totalPrice?: number;
  status: 'pending' | 'completed' | 'cancelled' | 'delivered' | 'confirmed';
  orderDate: Date;
  date?: string;
  createdAt?: string;
  title?: string;
  imageUrl?: string;
  stock?: number;
}

export interface CreateOrderPayload {
  customerId: number;
  customerName: string;
  phone: string;
  address: string;
  productId: number;
  price: number;
  size?: string;
  quantity: number;
}

export interface CreateOrderResponse {
  id: number;
  remainingStock: number;
  order?: Partial<Order>;
}
