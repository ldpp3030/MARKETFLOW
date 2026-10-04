import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'tienda',
  },
  {
    path: 'tienda',
    title: 'MARKETFLOW | Tienda',
    loadComponent: () =>
      import('./features/tienda/tienda.component').then((module) => module.TiendaComponent),
  },
  {
    path: 'pasillo',
    title: 'MARKETFLOW | Toma de Pedidos',
    loadComponent: () =>
      import('./features/pasillo/pasillo.component').then((module) => module.PasilloComponent),
  },
  {
    path: 'caja',
    title: 'MARKETFLOW | Terminal de Caja',
    loadComponent: () =>
      import('./features/caja/caja.component').then((module) => module.CajaComponent),
  },
  {
    path: 'login',
    title: 'MARKETFLOW | Iniciar Sesión',
    loadComponent: () =>
      import('./features/login/login.component').then((module) => module.LoginComponent),
  },
  {
    path: '**',
    redirectTo: 'tienda',
  },
];
