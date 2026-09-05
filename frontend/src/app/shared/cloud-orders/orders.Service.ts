import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  Url = 'http://localhost:3000';
  constructor(private http: HttpClient) {}
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.Url}/api/orders`);
  }

}
