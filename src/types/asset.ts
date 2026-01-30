export interface Asset {
  id: number;
  name: string;
  type: 'crypto' | 'stock' | 'cash' | 'deposit';
  currency: string;
  amount: number;
  created_at: string;
}
