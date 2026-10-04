import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { CartItem, Order, OrderOrigin, OrderStatus, Product } from '../models/product.model';
import { PRODUCT_CATALOG } from '../data/catalog';

const ORDERS_STORAGE_KEY = 'marketflow.orders';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly productsSubject = new BehaviorSubject<Product[]>(PRODUCT_CATALOG);
  private readonly cartSubject = new BehaviorSubject<CartItem[]>([]);
  private readonly ordersSubject = new BehaviorSubject<Order[]>(this.restoreOrders());

  readonly products$: Observable<Product[]> = this.productsSubject.asObservable();
  readonly cart$: Observable<CartItem[]> = this.cartSubject.asObservable();
  readonly orders$: Observable<Order[]> = this.ordersSubject.asObservable();

  readonly itemCount$: Observable<number> = this.cart$.pipe(map((items) => this.countItems(items)));
  readonly total$: Observable<number> = this.cart$.pipe(map((items) => this.calculateTotal(items)));
  readonly pendingOrders$: Observable<Order[]> = this.orders$.pipe(
    map((orders) => orders.filter((order) => order.status === 'PENDIENTE')),
  );

  getProducts(): Product[] {
    return this.productsSubject.value;
  }

  getProductById(productId: string): Product | undefined {
    return this.productsSubject.value.find((product) => product.id === productId);
  }

  getItems(): CartItem[] {
    return this.cartSubject.value;
  }

  getItemCount(): number {
    return this.countItems(this.cartSubject.value);
  }

  getTotal(): number {
    return this.calculateTotal(this.cartSubject.value);
  }

  getQuantity(productId: string): number {
    const item = this.cartSubject.value.find((cartItem) => cartItem.product.id === productId);
    return item ? item.quantity : 0;
  }

  addProduct(product: Product, quantity = 1): void {
    if (quantity <= 0) {
      return;
    }

    const items = this.cartSubject.value;
    const index = items.findIndex((item) => item.product.id === product.id);

    const nextItems =
      index === -1
        ? [...items, { product, quantity }]
        : items.map((item, itemIndex) =>
            itemIndex === index ? { ...item, quantity: item.quantity + quantity } : item,
          );

    this.cartSubject.next(nextItems);
  }

  decreaseProduct(productId: string): void {
    const nextItems = this.cartSubject.value
      .map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0);

    this.cartSubject.next(nextItems);
  }

  setQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeProduct(productId);
      return;
    }

    const nextItems = this.cartSubject.value.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item,
    );

    this.cartSubject.next(nextItems);
  }

  removeProduct(productId: string): void {
    this.cartSubject.next(
      this.cartSubject.value.filter((item) => item.product.id !== productId),
    );
  }

  clearCart(): void {
    this.cartSubject.next([]);
  }

  registerOrder(origin: OrderOrigin, userEmail?: string): Order {
    const items = this.cartSubject.value.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));

    const order: Order = {
      id: this.nextOrderId(),
      items,
      total: this.calculateTotal(items),
      date: new Date(),
      status: 'PENDIENTE',
      origin,
      userEmail,
    };

    this.saveOrders([order, ...this.ordersSubject.value]);
    this.clearCart();

    return order;
  }

  getOrders(): Order[] {
    return this.ordersSubject.value;
  }

  getPendingOrders(): Order[] {
    return this.ordersSubject.value.filter((order) => order.status === 'PENDIENTE');
  }

  getOrderById(orderId: string): Order | undefined {
    return this.ordersSubject.value.find((order) => order.id === orderId);
  }

  addProductToOrder(orderId: string, product: Product, quantity = 1): void {
    if (quantity <= 0) {
      return;
    }

    this.updateOrder(orderId, (order) => {
      const index = order.items.findIndex((item) => item.product.id === product.id);
      const items =
        index === -1
          ? [...order.items, { product, quantity }]
          : order.items.map((item, itemIndex) =>
              itemIndex === index ? { ...item, quantity: item.quantity + quantity } : item,
            );

      return { ...order, items, total: this.calculateTotal(items) };
    });
  }

  updateOrderItemQuantity(orderId: string, productId: string, quantity: number): void {
    this.updateOrder(orderId, (order) => {
      const items = order.items
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);

      return { ...order, items, total: this.calculateTotal(items) };
    });
  }

  removeOrderItem(orderId: string, productId: string): void {
    this.updateOrder(orderId, (order) => {
      const items = order.items.filter((item) => item.product.id !== productId);
      return { ...order, items, total: this.calculateTotal(items) };
    });
  }

  completeOrder(orderId: string): void {
    this.setOrderStatus(orderId, 'PROCESADO');
  }

  cancelOrder(orderId: string): void {
    this.setOrderStatus(orderId, 'CANCELADO');
  }

  private updateOrder(orderId: string, updater: (order: Order) => Order): void {
    const orders = this.ordersSubject.value.map((order) =>
      order.id === orderId ? updater(order) : order,
    );

    this.saveOrders(orders);
  }

  private setOrderStatus(orderId: string, status: OrderStatus): void {
    this.updateOrder(orderId, (order) => ({ ...order, status }));
  }

  private saveOrders(orders: Order[]): void {
    this.ordersSubject.next(orders);

    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      return;
    }
  }

  private restoreOrders(): Order[] {
    try {
      const rawOrders = localStorage.getItem(ORDERS_STORAGE_KEY);

      if (!rawOrders) {
        return [];
      }

      const parsedOrders = JSON.parse(rawOrders) as (Omit<Order, 'date'> & { date: string })[];

      return parsedOrders.map((order) => ({ ...order, date: new Date(order.date) }));
    } catch {
      return [];
    }
  }

  private nextOrderId(): string {
    const highestNumber = this.ordersSubject.value.reduce((highest, order) => {
      const numericId = Number(order.id.replace('ORD-', ''));
      return Number.isFinite(numericId) && numericId > highest ? numericId : highest;
    }, 100);

    return `ORD-${highestNumber + 1}`;
  }

  private countItems(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }
}
