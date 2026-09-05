import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import { Order } from '../../models/order.model';
import { OrdersService } from '../../shared/cloud-orders/orders.Service';

// ============================================
// ✅ Types
// ============================================

type OrderStatus = Order['status'];

interface OrderApiResponse {
  _id?: string;
  id?: string;

  customerId?: number;
  cycleId?: number;

  customerName?: string;
  name?: string;

  phone?: string;
  phoneNumber?: string;

  address?: string;

  size?: string;

  product?: string;
  productName?: string;

  productId?: number | string;

  price?: number;
  quantity?: number | string;
  totalPrice?: number;

  status?: string;

  orderDate?: Date | string;
  createdAt?: Date | string;
  date?: Date | string;

  title?: string;
  imageUrl?: string;
  stock?: number | string;
}

type OrderResponse =
  | OrderApiResponse[]
  | OrderApiResponse
  | null
  | undefined;

// ============================================
// ✅ Component
// ============================================

@Component({
  selector: 'app-cloud-orders-table',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
  ],
  templateUrl: './cloudOrdersTable.html',
  styleUrls: ['../../pages/sales-overview/sales-overview.css'],
})

export class CloudOrdersTableComponent implements OnInit {

  // ============================================
  // ✅ Component State
  // ============================================

  readonly orders = signal<Order[]>([]);
  readonly loadingOrders = signal(true);

  // ============================================
  // ✅ Services
  // ============================================

  private readonly ordersService = inject(OrdersService);

  // ============================================
  // ✅ Lifecycle Hooks
  // ============================================

  ngOnInit(): void {

    this.loadOrders();

  }

  // ============================================
  // ✅ Load Cloud Orders
  // ============================================

  private loadOrders(): void {

    this.ordersService.getAllOrders().subscribe({

      next: (response) => {

        this.orders.set(this.normalizeOrders(response));

        this.loadingOrders.set(false);

      },

      error: () => {

        this.orders.set([]);

        this.loadingOrders.set(false);

      },

    });

  }

  // ============================================
  // ✅ Normalize API Response
  // ============================================

  private normalizeOrders(response: OrderResponse): Order[] {

    if (!response) {
      return [];
    }

    const items = Array.isArray(response)
      ? response
      : [response];

    return items.map((item, index) => ({

      id: this.getStringField(item._id, item.id) || `order-${index + 1}`,
      customerId: Number(item.customerId),
      customerName: this
        .getStringField(item.customerName, item.name)
        ?.toUpperCase(),

      phone: this.getStringField(item.phone, item.phoneNumber),

      address: this.getStringField(item.address),

      size: this.getStringField(item.size),

      product: this.getStringField(
        item.product,
        item.title,
        item.productName
      ),

      productId: this.getNumberField(item.productId) || undefined,

      price: this.getNumberField(item.price),

      quantity: this.getNumberField(item.quantity),

      totalPrice: this.getNumberField(item.totalPrice),

      status: this.normalizeStatus(item.status),

      orderDate: this.toDate(
        item.orderDate ??
        item.createdAt ??
        item.date
      ),

      title: this.getStringField(item.title),

      imageUrl: this.getStringField(item.imageUrl),

      stock: this.getNumberField(item.stock),

    }));

  }

  // ============================================
  // ✅ Track Orders
  // ============================================

  trackByOrder(_: number, order: Order): string {

    return order.id;

  }

  // ============================================
  // ✅ Get Status CSS Class
  // ============================================

  getStatusClass(status: OrderStatus): string {

    return `status-${status}`;

  }

  // ============================================
  // ✅ Normalize Order Status
  // ============================================

  private normalizeStatus(status: unknown): OrderStatus {

    const allowedStatuses: OrderStatus[] = [
      'pending',
      'completed',
      'cancelled',
      'delivered',
      'confirmed',
    ];

    return allowedStatuses.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : 'pending';

  }

  // ============================================
  // ✅ Convert Value To Date
  // ============================================

  private toDate(value: Date | string | undefined): Date {

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {

      const parsed = new Date(value);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }

    }

    return new Date();

  }

  // ============================================
  // ✅ Get String Field
  // ============================================

  private getStringField(...values: Array<string | undefined>): string {

    return values.find(
      (value) =>
        typeof value === 'string' &&
        value.trim().length > 0
    )?.trim() ?? '';

  }

  // ============================================
  // ✅ Convert Value To Number
  // ============================================

  private getNumberField(value: number | string | undefined): number {

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {

      const parsed = Number(value);

      return Number.isFinite(parsed)
        ? parsed
        : 0;

    }

    return 0;

  }

}