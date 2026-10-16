export interface Customer {
  id: number;
  name: string;
  phone: string;
  total_debt: number;
  created_at: Date;
}

export interface Category {
  id: number;
  name: string;
  type: 'Drink' | 'Food';
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  price: number;
  active: boolean;
}

export interface Transaction {
  id: number;
  customer_id: number;
  product_id: number | null;
  amount: number;
  type: 'debt' | 'payment'; // 'debt' is adding debt, 'payment' is paying debt
  created_at: Date;
}
