import { Product } from '../models/product.model';

export interface Category {
  id: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: 'despensa', label: 'Despensa' },
  { id: 'lacteos', label: 'Lácteos y Huevos' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'aseo', label: 'Aseo y Hogar' },
  { id: 'frutas', label: 'Frutas y Verduras' },
  { id: 'snacks', label: 'Snacks' },
];

export const CATEGORY_LABELS: Record<string, string> = CATEGORIES.reduce<Record<string, string>>(
  (labels, category) => {
    labels[category.id] = category.label;
    return labels;
  },
  {},
);

export const PRODUCT_CATALOG: Product[] = [
  {
    id: 'arroz-diana-1kg',
    name: 'Arroz Diana Premium 1kg',
    price: 3500,
    category: 'despensa',
    image: 'products/arroz.svg',
  },
  {
    id: 'aceite-girasol-1l',
    name: 'Aceite Girasol 1L',
    price: 8200,
    category: 'despensa',
    image: 'products/aceite.svg',
  },
  {
    id: 'leche-deslactosada-1l',
    name: 'Leche Deslactosada 1L',
    price: 4100,
    category: 'lacteos',
    image: 'products/leche.svg',
  },
  {
    id: 'cafe-sello-rojo-500g',
    name: 'Café Sello Rojo 500g',
    price: 12500,
    category: 'despensa',
    image: 'products/cafe.svg',
  },
  {
    id: 'azucar-incauca-1kg',
    name: 'Azúcar Incauca 1kg',
    price: 3800,
    category: 'despensa',
    image: 'products/azucar.svg',
  },
  {
    id: 'coca-cola-15l',
    name: 'Gaseosa Coca-Cola 1.5L',
    price: 5200,
    category: 'bebidas',
    image: 'products/gaseosa.svg',
  },
  {
    id: 'jabon-rey',
    name: 'Jabón Multiusos Rey',
    price: 2800,
    category: 'aseo',
    image: 'products/jabon.svg',
  },
  {
    id: 'huevos-x30',
    name: 'Cubeta de Huevos x30',
    price: 16500,
    category: 'lacteos',
    image: 'products/huevos.svg',
  },
  {
    id: 'pan-tajado',
    name: 'Pan Tajado Bimbo',
    price: 6200,
    category: 'despensa',
    image: 'products/pan.svg',
  },
  {
    id: 'banano-kg',
    name: 'Banano Criollo kg',
    price: 3200,
    category: 'frutas',
    image: 'products/banano.svg',
  },
  {
    id: 'tomate-kg',
    name: 'Tomate Chonto kg',
    price: 4500,
    category: 'frutas',
    image: 'products/tomate.svg',
  },
  {
    id: 'papas-margarita',
    name: 'Papas Margarita 105g',
    price: 4800,
    category: 'snacks',
    image: 'products/papas.svg',
  },
  {
    id: 'detergente-fab',
    name: 'Detergente Fab 900g',
    price: 9800,
    category: 'aseo',
    image: 'products/detergente.svg',
  },
  {
    id: 'jugo-hit-mora',
    name: 'Jugo Hit Mora 1L',
    price: 3900,
    category: 'bebidas',
    image: 'products/jugo.svg',
  },
  {
    id: 'queso-campesino',
    name: 'Queso Campesino 250g',
    price: 8900,
    category: 'lacteos',
    image: 'products/queso.svg',
  },
];
