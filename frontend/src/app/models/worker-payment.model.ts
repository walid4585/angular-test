export interface WorkerPayment {

    id?: number;

    workerId: number;

    amount: number;

    paymentType: 'salary' | 'advance' | 'bonus' | 'deduction';

    paymentDate: string;

    note?: string;

    createdAt?: string;

}