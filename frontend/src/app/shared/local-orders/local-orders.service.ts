import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concatMap, from, map, Observable, toArray } from 'rxjs';
import {
  CreateOrderPayload,
  CreateOrderResponse,
  Order,
} from '../../models/order.model';

interface OrdersResponse {

  success: boolean;

  data: Order[];

}

@Injectable({
  providedIn: 'root',
})
export class LocalOrdersService {
  private readonly url = 'http://localhost:5000/api/orders';

  constructor(private http: HttpClient) {}

  getLocalOrders(customerKey?: number | string): Observable<Order[]> {
    return this.http.get<OrdersResponse>(this.url).pipe(
      map((response) => this.filterOrdersByCustomer(response.data, customerKey))
    );
  }

  // ============================================
// ✅ Get Orders By Customer Id
// ============================================

getOrdersByCustomer(customerId: number): Observable<Order[]> {

  return this.http.get<OrdersResponse>(
    `${this.url}?customerId=${customerId}`
  ).pipe(
    map(response => response.data)
  );

}

  getLocalOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.url}/${id}`);
  }

  addOrder(order: CreateOrderPayload): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.url, order);
  }

  addOrders(orders: CreateOrderPayload[]): Observable<CreateOrderResponse[]> {
    return from(orders).pipe(concatMap((order) => this.addOrder(order)), toArray());
  }

  deleteOrder(id: string): Observable<void> {
  return this.http.delete<void>(`${this.url}/${id}`);
}

  private filterOrdersByCustomer(
    orders: Order[],
    customerKey?: number | string
  ): Order[] {
    const normalizedKey = String(customerKey ?? '').trim().toLowerCase();

    if (!normalizedKey) {
      return orders;
    }

    return orders.filter((order: any) => {
      const fields = [
        order.id,
        order.phone,
        order.customerPhone,
        order.customerName,
        order.name,
      ];

      return fields.some(
        (field) =>
          String(field ?? '').trim().toLowerCase() === normalizedKey
      );
    });
  }

  // ============================================
// ✅ Update Order
// ============================================

updateOrder(order: Order): Observable<void> {

  return this.http.put<void>(

    `${this.url}/${order.id}`,

    order

  );

}
}
