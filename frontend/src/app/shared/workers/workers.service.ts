import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Worker } from '../../models/worker.model';
import { WorkerDetailsResponse } from '../../models/worker-details-response.model';
import { WorkerCycleHistory } from '../../models/worker-cycle-history.model';

interface ApiMutationResponse {
  lastID: number;
  changes: number;
}

@Injectable({
  providedIn: 'root',
})
export class WorkersService {
private readonly http = inject(HttpClient)
private readonly url = 'http://localhost:5000/workers'

 // ============================================
  // ✅ Create Worker
  // ============================================
  createWorker(worker: Worker) {
    return this.http.post<ApiMutationResponse>(
      this.url,
      worker
    );
  }

  // ============================================
  // ✅ Get All Workers
  // ============================================
  getWorkers() {
    return this.http.get<Worker[]>(this.url);
  }

  // ============================================
// ✅ Get Worker By Id
// ============================================
  getWorkerById(id: number) {

  return this.http.get<Worker>(`${this.url}/${id}`);

}
// ============================================
// ✅ Get Worker Details
// ============================================
getWorkerDetails(id: number) {

  return this.http.get<WorkerDetailsResponse>(
    `${this.url}/${id}/details`
  );

}


// ============================================
// ✅ Get Worker Cycles History
// ============================================

getWorkerCyclesHistory(id: number) {

  return this.http.get<WorkerCycleHistory[]>(
    `${this.url}/${id}/cycles`
  );

}
}