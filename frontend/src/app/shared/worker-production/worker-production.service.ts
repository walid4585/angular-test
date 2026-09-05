import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { WorkerProduction } from '../../models/worker-production.model';

import { WorkerCycleHistory } from '../../models/worker-cycle-history.model';

// ============================================
// ✅ Service
// ============================================

@Injectable({

    providedIn: 'root'

})

export class WorkerProductionService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        'http://localhost:5000/api/worker-production';

    // ============================================
    // ✅ Get Worker Production
    // ============================================

    getWorkerProduction(

        workerId: number

    ): Observable<WorkerProduction[]> {

        return this.http.get<WorkerProduction[]>(

            `${this.apiUrl}/${workerId}`

        );

    }

    // ============================================
    // ✅ Add Production
    // ============================================

    addProduction(

        production: WorkerProduction

    ): Observable<any> {

        return this.http.post(

            this.apiUrl,

            production

        );

    }
// ============================================
// ✅ Delete Production
// ============================================

deleteProduction(id: number) {

    return this.http.delete(

        `${this.apiUrl}/${id}`

    );

}
// ============================================
// ✅ Update Production
// ============================================

updateProduction(id: number, production: WorkerProduction) {

    return this.http.put(

        `${this.apiUrl}/${id}`,

        production

    );

}

// ============================================
// ✅ Get Worker Cycles History
// ============================================

getWorkerCycles(
    workerId: number
): Observable<WorkerCycleHistory[]> {

    return this.http.get<WorkerCycleHistory[]>(
        `${this.apiUrl}/${workerId}/cycles`
    );

}

}



