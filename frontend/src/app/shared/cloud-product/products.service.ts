import { Injectable } from '@angular/core';
import { HttpClient   } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductApiResponse, ProductUpdatePayload } from '../../models/product.model';

export interface CreateProductPayload {
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

export interface UpdateProductPayload {
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  stock?: number;
  sizes?: string[];
  active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  url = 'http://localhost:3000/api';
  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductApiResponse[]> {
    return this.http.get<ProductApiResponse[]>(`${this.url}/products`);
  }

  getProductById(id: string): Observable<ProductApiResponse> {
    return this.http.get<ProductApiResponse>(`${this.url}/products/${id}`);
  }

  addProduct(product: CreateProductPayload | FormData): Observable<unknown> {
    return this.http.post<unknown>(`${this.url}/products`, product);
  }

  updateProduct(id: string, product: ProductUpdatePayload): Observable<unknown> {
    return this.http.put<unknown>(`${this.url}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/products/${id}`);
  }
  archiveProduct(id: string) {
  return this.http.patch(
    `${this.url}/${id}/archive`,
    {}
  );
}
}
