import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { PRODUCT_CATALOG } from '../../core/data/catalog';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { TiendaComponent } from './tienda.component';

describe('TiendaComponent', () => {
  let cartService: CartService;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TiendaComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    cartService = TestBed.inject(CartService);
    authService = TestBed.inject(AuthService);
  });

  it('redirige a /login conservando el carrito cuando no hay sesión', () => {
    const fixture = TestBed.createComponent(TiendaComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    cartService.addProduct(PRODUCT_CATALOG[0]);
    fixture.componentInstance.sendToCash();

    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/tienda' },
    });
    expect(cartService.getItemCount()).toBe(1);
    expect(cartService.getOrders()).toEqual([]);
  });

  it('registra el pedido con la sesión iniciada', () => {
    authService.login('cliente@marketflow.com');
    const fixture = TestBed.createComponent(TiendaComponent);
    fixture.detectChanges();

    cartService.addProduct(PRODUCT_CATALOG[0], 2);
    fixture.componentInstance.sendToCash();

    const orders = cartService.getOrders();
    expect(orders.length).toBe(1);
    expect(orders[0].origin).toBe('TIENDA');
    expect(orders[0].userEmail).toBe('cliente@marketflow.com');
    expect(cartService.getItemCount()).toBe(0);
  });
});
