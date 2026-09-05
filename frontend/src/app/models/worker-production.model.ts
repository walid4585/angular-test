// ============================================
// ✅ Interfaces
// ============================================

export interface WorkerProduction {

    id?: number;

    workerId: number;

    cycleId?: number;

    workTypeId: number;

    workTypeName?: string;

    quantity: number;
    

    price?: number;

    total?: number;

    productionDate: string;

    notes?: string;

}