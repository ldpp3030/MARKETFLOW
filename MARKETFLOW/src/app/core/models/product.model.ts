export type OrderStatus = 'PENDIENTE' | 'PROCESADO' | 'CANCELADO';

export type OrderOrigin = 'PASILLO' | 'TIENDA';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
  status: OrderStatus;
  origin: OrderOrigin;
  userEmail?: string;
}
