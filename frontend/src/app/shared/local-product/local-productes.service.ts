import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProductApiResponse,
  ProductRecord,
  ProductUpdatePayload,
  normalizeProduct
} from '../../models/product.model';

import { map } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class LocalProductesService {
  private readonly url = 'http://localhost:5000/api';
  constructor(private http: HttpClient) {}

 addProduct(product: FormData): Observable<unknown> {
     return this.http.post<unknown>(`${this.url}/products`, product);
   }

  getProducts(): Observable<ProductRecord[]> {
  return this.http
    .get<ProductApiResponse[]>(`${this.url}/products`)
    .pipe(
      map(products => products.map(normalizeProduct))
    );
}
  updateProduct(id: string, product: ProductUpdatePayload): Observable<unknown> {
    return this.http.put<unknown>(`${this.url}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/products/${id}`);
  }
  archiveProduct(id: string) {
  return this.http.patch(
    `${this.url}/products/${id}/archive`,
    {}
  );
}
}
