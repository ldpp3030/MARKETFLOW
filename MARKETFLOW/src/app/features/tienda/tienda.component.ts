import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CATEGORIES, CATEGORY_LABELS } from '../../core/data/catalog';
import { CartItem, Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-tienda',
  imports: [CurrencyPipe, RouterLink, RouterLinkActive],
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiendaComponent {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly categories = CATEGORIES;
  readonly products = this.cartService.getProducts();
  readonly cart = toSignal(this.cartService.cart$, { initialValue: [] as CartItem[] });
  readonly user = toSignal(this.authService.user$, { initialValue: null });
  readonly searchTerm = signal('');
  readonly activeCategory = signal('todos');

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const activeCategory = this.activeCategory();

    return this.products.filter((product) => {
      const matchesCategory = activeCategory === 'todos' || product.category === activeCategory;
      const matchesSearch =
        term === '' ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
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

  categoryLabel(categoryId: string): string {
    return CATEGORY_LABELS[categoryId] ?? categoryId;
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

  clearCart(): void {
    this.cartService.clearCart();
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  setCategory(categoryId: string): void {
    this.activeCategory.set(categoryId);
  }

  scrollToCart(): void {
    document.getElementById('cart-sidebar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  logout(): void {
    this.authService.logout();
    this.toastService.show('Sesión cerrada', 'info');
  }

  sendToCash(): void {
    if (this.itemCount() === 0) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.toastService.show('Inicia sesión para enviar tu pedido a caja', 'info');
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/tienda' } });
      return;
    }

    const order = this.cartService.registerOrder('TIENDA', this.authService.getUser() ?? undefined);
    this.toastService.show(`Pedido ${order.id} enviado a caja`);
  }
}
