import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CATEGORIES } from '../../core/data/catalog';
import { CartItem, Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-pasillo',
  imports: [CurrencyPipe],
  templateUrl: './pasillo.component.html',
  styleUrl: './pasillo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasilloComponent {
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  readonly categories = CATEGORIES;
  readonly products = this.cartService.getProducts();
  readonly cart = toSignal(this.cartService.cart$, { initialValue: [] as CartItem[] });
  readonly activeCategory = signal('todos');
  readonly cartOpen = signal(false);

  readonly filteredProducts = computed(() => {
    const activeCategory = this.activeCategory();

    return activeCategory === 'todos'
      ? this.products
      : this.products.filter((product) => product.category === activeCategory);
  });

  readonly itemCount = computed(() =>
    this.cart().reduce((total, item) => total + item.quantity, 0),
  );

  readonly total = computed(() =>
    this.cart().reduce((total, item) => total + item.product.price * item.quantity, 0),
  );

  quantityOf(productId: string): number {
    return this.cart().find((item) => item.product.id === productId)?.quantity ?? 0;
  }

  add(product: Product): void {
    this.cartService.addProduct(product);
  }

  decrease(productId: string): void {
    this.cartService.decreaseProduct(productId);
  }

  remove(productId: string): void {
    this.cartService.removeProduct(productId);
  }

  setCategory(categoryId: string): void {
    this.activeCategory.set(categoryId);
  }

  toggleCart(): void {
    this.cartOpen.update((open) => !open);
  }

  closeCart(): void {
    this.cartOpen.set(false);
  }

  sendToCash(): void {
    if (this.itemCount() === 0) {
      return;
    }

    const order = this.cartService.registerOrder('PASILLO');
    this.cartOpen.set(false);
    this.toastService.show(`Pedido ${order.id} enviado a caja`);
  }
}
