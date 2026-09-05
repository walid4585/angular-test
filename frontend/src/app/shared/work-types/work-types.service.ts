import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

export interface WorkType {

    id?: number;

    name: string;

    piecePrice: number;

    active?: number;

    createdAt?: string;

}

@Injectable({

    providedIn: 'root'

})
export class WorkTypesService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        'http://localhost:5000/api/work-types';

    // ============================================
    // ✅ Get All
    // ============================================

    getWorkTypes(): Observable<WorkType[]> {

        return this.http.get<WorkType[]>(

            this.apiUrl

        );

    }

    // ============================================
    // ✅ Get By Id
    // ============================================

    getWorkType(id: number): Observable<WorkType> {

        return this.http.get<WorkType>(

            `${this.apiUrl}/${id}`

        );

    }

    // ============================================
    // ✅ Create
    // ============================================

    createWorkType(

        workType: WorkType

    ): Observable<any> {

        return this.http.post(

            this.apiUrl,

            workType

        );

    }

    // ============================================
    // ✅ Update
    // ============================================

    updateWorkType(

        id: number,

        workType: WorkType

    ): Observable<any> {

        return this.http.put(

            `${this.apiUrl}/${id}`,

            workType

        );

    }

    // ============================================
    // ✅ Delete
    // ============================================

    deleteWorkType(

        id: number

    ): Observable<any> {

        return this.http.delete(

            `${this.apiUrl}/${id}`

        );

    }

}