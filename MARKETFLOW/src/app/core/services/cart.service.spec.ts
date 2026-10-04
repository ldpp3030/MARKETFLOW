import { TestBed } from '@angular/core/testing';
import { PRODUCT_CATALOG } from '../data/catalog';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  const product = PRODUCT_CATALOG[0];
  const otherProduct = PRODUCT_CATALOG[1];

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('arranca con carrito vacío y sin órdenes', () => {
    expect(service.getItems()).toEqual([]);
    expect(service.getOrders()).toEqual([]);
    expect(service.getItemCount()).toBe(0);
    expect(service.getTotal()).toBe(0);
  });

  it('agrega productos y calcula totales', () => {
    service.addProduct(product, 2);
    service.addProduct(otherProduct);

    expect(service.getItemCount()).toBe(3);
    expect(service.getTotal()).toBe(product.price * 2 + otherProduct.price);
    expect(service.getQuantity(product.id)).toBe(2);
  });

  it('no muta los snapshots anteriores al agregar', () => {
    service.addProduct(product);
    const previousSnapshot = service.getItems();
    const previousItem = previousSnapshot[0];

    service.addProduct(product);

    expect(previousItem.quantity).toBe(1);
    expect(previousSnapshot).not.toBe(service.getItems());
    expect(service.getQuantity(product.id)).toBe(2);
  });

  it('decrementa, elimina al llegar a cero y emite en los observables', () => {
    service.addProduct(product, 2);
    const emissions: number[] = [];
    const subscription = service.itemCount$.subscribe((count) => emissions.push(count));

    service.decreaseProduct(product.id);
    service.decreaseProduct(product.id);

    expect(emissions).toEqual([2, 1, 0]);
    expect(service.getItems()).toEqual([]);
    subscription.unsubscribe();
  });

  it('registra una orden pendiente y vacía el carrito', () => {
    service.addProduct(product, 3);

    const order = service.registerOrder('PASILLO');

    expect(order.id).toBe('ORD-101');
    expect(order.status).toBe('PENDIENTE');
    expect(order.origin).toBe('PASILLO');
    expect(order.total).toBe(product.price * 3);
    expect(service.getItems()).toEqual([]);
    expect(service.getPendingOrders().length).toBe(1);
  });

  it('incrementa la secuencia de órdenes y guarda el correo', () => {
    service.addProduct(product);
    service.registerOrder('PASILLO');
    service.addProduct(product);

    const secondOrder = service.registerOrder('TIENDA', 'cliente@marketflow.com');

    expect(secondOrder.id).toBe('ORD-102');
    expect(secondOrder.userEmail).toBe('cliente@marketflow.com');
  });

  it('edita cantidades y elimina items de una orden', () => {
    service.addProduct(product);
    service.addProduct(otherProduct);
    const order = service.registerOrder('TIENDA');

    service.updateOrderItemQuantity(order.id, product.id, 5);
    service.removeOrderItem(order.id, otherProduct.id);

    const updated = service.getOrderById(order.id);
    expect(updated?.items.length).toBe(1);
    expect(updated?.items[0].quantity).toBe(5);
    expect(updated?.total).toBe(product.price * 5);
  });

  it('completa y cancela órdenes', () => {
    service.addProduct(product);
    const firstOrder = service.registerOrder('PASILLO');
    service.addProduct(product);
    const secondOrder = service.registerOrder('PASILLO');

    service.completeOrder(firstOrder.id);
    service.cancelOrder(secondOrder.id);

    expect(service.getOrderById(firstOrder.id)?.status).toBe('PROCESADO');
    expect(service.getOrderById(secondOrder.id)?.status).toBe('CANCELADO');
    expect(service.getPendingOrders()).toEqual([]);
  });

  it('persiste las órdenes en localStorage', () => {
    service.addProduct(product);

    const order = service.registerOrder('PASILLO');

    expect(localStorage.getItem('marketflow.orders')).toContain(order.id);
  });
});
