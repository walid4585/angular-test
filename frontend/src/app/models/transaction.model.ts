export interface Transaction {
    id?: number;

    type: string;
    direction: 'IN' | 'OUT';

    amount: number;

    entityType?: string;
    entityId?: number;

    cycleId?: number;   // اختياري

    orderId?: number | null;

    note?: string;

    transactionDate: string;

    status?: string;

    createdAt?: string;
}