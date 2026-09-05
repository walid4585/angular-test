import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CustomerRecord,
  CreateCustomerPayload,
} from '../../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class LocalCustomersService {

  private readonly url = 'http://localhost:5000/api/customers';

  constructor(private http: HttpClient) {}

  // ============================================
// ✅ Get Customer Cycles History
// ============================================

getCustomerCyclesHistory(customerId: number): Observable<any> {

  return this.http.get<any>(
    `${this.url}/${customerId}/history`
  );

}

getCustomerAccount(customerId: number): Observable<any> {

  return this.http.get<any>(
    `${this.url}/${customerId}/details`
  );

}


  checkCustomer(name: string, phone: string): Observable<any> {
    return this.http.post<any>(`${this.url}/check`, {
      name,
      phone,
    });
  }

  registerCustomer(
    customer: CreateCustomerPayload
  ): Observable<any> {
    return this.http.post<any>(this.url, customer);
  }

  getCustomers(): Observable<any> {
    return this.http.get<any>(this.url);
  }

  getCustomer(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  getOrCreateGeneralCustomer(): Observable<{ success: boolean; data: CustomerRecord }> {
    return this.http.get<{ success: boolean; data: CustomerRecord }>(`${this.url}/general`);
  }
}
