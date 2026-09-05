export interface Worker {
  id?: number;

  name: string;

  phone?: string;

  address?: string;

  job?: string;

  paymentType: 'monthly' | 'piece'|'tailor';

  monthlySalary: number;

  active?: number;

  createdAt?: string;
}
