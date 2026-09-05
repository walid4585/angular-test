import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AccountCycle {
  id: number;
  accountType: string;
  entityId: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StartAccountCycleResponse {
  cycle: AccountCycle;
}

@Injectable({
  providedIn: 'root'
})
export class AccountCyclesService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5000/api/account-cycles';

  startAccountCycle(
    accountType: string,
    entityId: number
  ): Observable<StartAccountCycleResponse> {

    return this.http.post<StartAccountCycleResponse>(
      `${this.apiUrl}/start`,
      {
        accountType,
        entityId
      }
    );

  }

}