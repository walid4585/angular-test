export interface CustomerRecord {

  id: number;

  name: string;

  email: string | null;

  phone: string;

  address: string | null;

  notes: string | null;

  category: 'temporary' | 'regular';

  hasAccount: number;

  isArchived: number;

  createdAt: string;

  updatedAt: string | null;

}

export interface CreateCustomerPayload {
  name: string;

  email: string | null;

  phone: string;

  address: string | null;

  notes: string | null;

  category: 'temporary' | 'regular';

  hasAccount: number;

  isArchived: number;

  
}