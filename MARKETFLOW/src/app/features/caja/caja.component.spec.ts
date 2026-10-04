import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PRODUCT_CATALOG } from '../../core/data/catalog';
import { CartService } from '../../core/services/cart.service';
import { CajaComponent } from './caja.component';

describe('CajaComponent', () => {
  let cartService: CartService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CajaComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    cartService = TestBed.inject(CartService);
  });

  function createOrder(quantity = 2) {
    cartService.addProduct(PRODUCT_CATALOG[0], quantity);
    return cartService.registerOrder('PASILLO');
  }

  it('solo habilita el cobro en efectivo cuando el valor cubre el total', () => {
    const order = createOrder(2);
    const fixture = TestBed.createComponent(CajaComponent);
    const caja = fixture.componentInstance;
    fixture.detectChanges();

    caja.selectOrder(order.id);
    expect(caja.canCharge()).toBe(false);

    caja.onCashInput({ target: { value: '1000' } } as unknown as Event);
    expect(caja.canCharge()).toBe(false);
    expect(caja.change()).toBe(0);

    caja.onCashInput({ target: { value: String(order.total + 500) } } as unknown as Event);
    expect(caja.canCharge()).toBe(true);
    expect(caja.change()).toBe(500);
  });

  it('habilita el cobro con tarjeta sin calcular devueltas', () => {
    const order = createOrder(1);
    const fixture = TestBed.createComponent(CajaComponent);
    const caja = fixture.componentInstance;
    fixture.detectChanges();

    caja.selectOrder(order.id);
    caja.setPaymentMethod('tarjeta');

    expect(caja.isCashPayment()).toBe(false);
    expect(caja.canCharge()).toBe(true);
  });

  it('permite editar las cantidades del pedido seleccionado', () => {
    const order = createOrder(1);
    const fixture = TestBed.createComponent(CajaComponent);
    const caja = fixture.componentInstance;
    fixture.detectChanges();

    caja.selectOrder(order.id);
    caja.increaseItem(PRODUCT_CATALOG[0].id);
    expect(caja.selectedOrder()?.items[0].quantity).toBe(2);

    caja.decreaseItem(PRODUCT_CATALOG[0].id);
    caja.decreaseItem(PRODUCT_CATALOG[0].id);

    expect(caja.selectedOrder()?.items.length).toBe(0);
    expect(caja.canCharge()).toBe(false);
  });

  it('cobra la orden y la retira de la cola', () => {
    const order = createOrder(1);
    const fixture = TestBed.createComponent(CajaComponent);
    const caja = fixture.componentInstance;
    fixture.detectChanges();

    caja.selectOrder(order.id);
    caja.setPaymentMethod('nequi');
    caja.charge();

    expect(cartService.getOrderById(order.id)?.status).toBe('PROCESADO');
    expect(caja.pendingOrders().length).toBe(0);
    expect(caja.selectedOrder()).toBeNull();
  });
});
