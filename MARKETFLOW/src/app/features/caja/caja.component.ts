import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Order, OrderOrigin } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'nequi';

@Component({
  selector: 'app-caja',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './caja.component.html',
  styleUrl: './caja.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CajaComponent {
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  readonly catalog = this.cartService.getProducts();
  readonly orders = toSignal(this.cartService.orders$, { initialValue: [] as Order[] });
  readonly selectedOrderId = signal<string | null>(null);
  readonly paymentMethod = signal<PaymentMethod>('efectivo');
  readonly cashReceived = signal(0);
  readonly productToAdd = signal('');

  readonly pendingOrders = computed(() =>
    this.orders().filter((order) => order.status === 'PENDIENTE'),
  );

  readonly selectedOrder = computed(
    () => this.orders().find((order) => order.id === this.selectedOrderId()) ?? null,
  );

  readonly selectedOrderItemCount = computed(
    () => this.selectedOrder()?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
  );

  readonly selectedOrderTotal = computed(() => this.selectedOrder()?.total ?? 0);

  readonly isCashPayment = computed(() => this.paymentMethod() === 'efectivo');

  readonly change = computed(() => Math.max(0, this.cashReceived() - this.selectedOrderTotal()));

  readonly canCharge = computed(() => {
    const order = this.selectedOrder();

    if (!order || order.items.length === 0) {
      return false;
    }

    if (!this.isCashPayment()) {
      return true;
    }

    return this.cashReceived() >= order.total;
  });

  readonly cashInsufficient = computed(
    () => this.isCashPayment() && this.cashReceived() > 0 && !this.canCharge(),
  );

  originLabel(origin: OrderOrigin): string {
    return origin === 'TIENDA' ? 'Tienda web' : 'Pasillos';
  }

  orderItemCount(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  selectOrder(orderId: string): void {
    this.selectedOrderId.set(orderId);
    this.cashReceived.set(0);
    this.paymentMethod.set('efectivo');
    this.productToAdd.set('');
  }

  increaseItem(productId: string): void {
    const order = this.selectedOrder();
    const item = order?.items.find((orderItem) => orderItem.product.id === productId);

    if (!order || !item) {
      return;
    }

    this.cartService.updateOrderItemQuantity(order.id, productId, item.quantity + 1);
  }

  decreaseItem(productId: string): void {
    const order = this.selectedOrder();
    const item = order?.items.find((orderItem) => orderItem.product.id === productId);

    if (!order || !item) {
      return;
    }

    this.cartService.updateOrderItemQuantity(order.id, productId, item.quantity - 1);
  }

  removeItem(productId: string): void {
    const order = this.selectedOrder();

    if (!order) {
      return;
    }

    this.cartService.removeOrderItem(order.id, productId);
  }

  onSelectProduct(event: Event): void {
    this.productToAdd.set((event.target as HTMLSelectElement).value);
  }

  addProductToOrder(): void {
    const order = this.selectedOrder();
    const product = this.cartService.getProductById(this.productToAdd());

    if (!order || !product) {
      return;
    }

    this.cartService.addProductToOrder(order.id, product);
    this.productToAdd.set('');
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);

    if (method !== 'efectivo') {
      this.toastService.show('Pago exacto procesado vía terminal digital', 'info');
    }
  }

  onCashInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.cashReceived.set(Number.isFinite(value) && value > 0 ? value : 0);
  }

  charge(): void {
    const order = this.selectedOrder();

    if (!order || !this.canCharge()) {
      return;
    }

    this.cartService.completeOrder(order.id);
    this.toastService.show(`Cobro exitoso para ${order.id}. Factura generada.`);
    this.resetSelection();
  }

  cancel(): void {
    const order = this.selectedOrder();

    if (!order) {
      return;
    }

    if (window.confirm(`¿Cancelar el pedido ${order.id}? Esta acción no se puede deshacer.`)) {
      this.cartService.cancelOrder(order.id);
      this.toastService.show(`Pedido ${order.id} cancelado`, 'info');
      this.resetSelection();
    }
  }

  private resetSelection(): void {
    this.selectedOrderId.set(null);
    this.cashReceived.set(0);
    this.paymentMethod.set('efectivo');
    this.productToAdd.set('');
  }
}
