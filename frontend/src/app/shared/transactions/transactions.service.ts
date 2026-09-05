import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Transaction } from '../../models/transaction.model';

interface ApiMutationResponse {

  lastID: number;

  changes: number;

}

@Injectable({

  providedIn: 'root',

})
export class TransactionsService {

  // ============================================
  // ✅ API
  // ============================================

  private readonly url = 'http://localhost:5000/transactions';

  private http = inject(HttpClient);

  // ============================================
  // ✅ Create Transaction
  // ============================================

  createTransaction(transaction: Transaction) {

    return this.http.post<ApiMutationResponse>(

      this.url,

      transaction

    );

  }

  // ============================================
  // ✅ Get Transactions
  // ============================================

  getTransactions(filters?: any) {

    let params = new HttpParams();

    if (filters) {

      Object.keys(filters).forEach(key => {

        params = params.set(

          key,

          String(filters[key])

        );

      });

    }

    return this.http.get<Transaction[]>(

      this.url,

      {

        params

      }

    );

  }

  // ============================================
  // ✅ Get Transaction By Id
  // ============================================

  getTransactionById(id: number) {

    return this.http.get<Transaction>(

      `${this.url}/${id}`

    );

  }

  // ============================================
  // ✅ Update Transaction
  // ============================================

  updateTransaction(

    id: number,

    transaction: Transaction

  ) {

    return this.http.put<ApiMutationResponse>(

      `${this.url}/${id}`,

      transaction

    );

  }

  // ============================================
  // ✅ Delete Transaction
  // ============================================

  deleteTransaction(id: number) {

    return this.http.delete<ApiMutationResponse>(

      `${this.url}/${id}`

    );

  }

}