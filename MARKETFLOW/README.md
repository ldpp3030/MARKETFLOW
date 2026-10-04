# MARKETFLOW

PWA unificada de gestión de pedidos y caja en tiempo real, construida con Angular 22
(standalone components, zoneless, RxJS, Angular Router y Service Worker).

## Módulos

| Ruta       | Descripción                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `/tienda`  | Portal web del cliente (responsive) con resumen lateral y autenticación.     |
| `/pasillo` | App móvil de toma de pedidos (máx. 480px) con panel de edición del carrito.  |
| `/caja`    | Terminal POS: cola de pedidos en vivo, edición de la orden, pagos y cambio.  |
| `/login`   | Inicio de sesión con retorno a la vista de origen (`returnUrl`).             |

Todos los módulos comparten el estado a través de `CartService` (`BehaviorSubject`),
por lo que los pedidos enviados desde pasillos o tienda aparecen al instante en caja.
Las órdenes y la sesión se persisten en `localStorage`.

## Comandos

```bash
npm start        # servidor de desarrollo: http://localhost:4200
npm run build    # build de producción: dist/MARKETFLOW/browser
npm test         # pruebas unitarias (Vitest + TestBed)
```

## PWA

El service worker (`ngsw-worker.js`) se registra automáticamente en producción y el
manifest (`public/manifest.webmanifest`) usa iconos de marca. Para probar la PWA:

```bash
npm run build
npx http-server dist/MARKETFLOW/browser -p 8080
```

Abre `http://localhost:8080` y usa "Instalar aplicación" en el navegador.
